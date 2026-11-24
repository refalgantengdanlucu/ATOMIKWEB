import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, before, beforeEach, test } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

const projectId = 'demo-atomika-security';
const institutionA = 'school_a';
const institutionB = 'school_b';
let testEnvironment;

const studentProfile = (uid, institutionId) => ({
  name: `Siswa ${uid}`,
  className: 'X-1',
  institutionId,
});

const activityRecord = (uid, institutionId) => ({
  uid,
  institutionId,
  name: `Siswa ${uid}`,
  className: 'X-1',
  activity: 'Materi',
  path: '/materi',
  progressSummary: 'T1 1/5',
  lastSeen: '2026-11-24T00:00:00.000Z',
});

const quizAttempt = (uid, institutionId, id) => ({
  id,
  uid,
  institutionId,
  alias: `Siswa ${uid}`,
  className: 'X-1',
  quizTitle: 'Kuis Topik 1',
  elapsedSeconds: 30,
  status: 'submitted',
  activityName: 'Kuis Topik 1',
  moduleId: 't1',
  attemptType: 'practice',
  questionVersion: 'v1',
  answers: { q1: 'a' },
  score: 1,
  maxScore: 5,
  percent: 20,
  submittedAt: '2026-11-24T00:00:00.000Z',
  serverReceivedAt: serverTimestamp(),
});

before(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: await readFile(new URL('../firestore.rules', import.meta.url), 'utf8'),
    },
  });
});

beforeEach(async () => {
  await testEnvironment.clearFirestore();
  await testEnvironment.withSecurityRulesDisabled(async ({ firestore }) => {
    await setDoc(doc(firestore, 'profiles/student-a'), studentProfile('student-a', institutionA));
    await setDoc(doc(firestore, 'profiles/student-b'), studentProfile('student-b', institutionA));
    await setDoc(doc(firestore, 'profiles/student-c'), studentProfile('student-c', institutionB));
    await setDoc(doc(firestore, 'teachers/teacher-a'), { institutionId: institutionA });
    await setDoc(doc(firestore, 'teachers/teacher-b'), { institutionId: institutionB });
    await setDoc(doc(firestore, 'student_activities/student-b'), activityRecord('student-b', institutionA));
    await setDoc(doc(firestore, 'quiz_attempts/attempt-b'), {
      ...quizAttempt('student-b', institutionA, 'attempt-b'),
      serverReceivedAt: new Date('2026-11-24T00:00:00.000Z'),
    });
    await setDoc(doc(firestore, 'quiz_attempts/attempt-c'), {
      ...quizAttempt('student-c', institutionB, 'attempt-c'),
      serverReceivedAt: new Date('2026-11-24T00:00:00.000Z'),
    });
  });
});

after(async () => {
  await testEnvironment?.cleanup();
});

test('unauthenticated users cannot read student records', async () => {
  const firestore = testEnvironment.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(firestore, 'profiles/student-a')));
  await assertFails(getDoc(doc(firestore, 'student_activities/student-b')));
  await assertFails(getDoc(doc(firestore, 'quiz_attempts/attempt-b')));
});

test('a student can create only their own activity and quiz attempt', async () => {
  const firestore = testEnvironment.authenticatedContext('student-a').firestore();

  await assertSucceeds(setDoc(
    doc(firestore, 'student_activities/student-a'),
    activityRecord('student-a', institutionA),
  ));
  await assertSucceeds(setDoc(
    doc(firestore, 'quiz_attempts/attempt-a'),
    quizAttempt('student-a', institutionA, 'attempt-a'),
  ));
  await assertFails(setDoc(
    doc(firestore, 'student_activities/student-a'),
    activityRecord('student-b', institutionA),
  ));
  await assertFails(setDoc(
    doc(firestore, 'quiz_attempts/spoofed-attempt'),
    quizAttempt('student-b', institutionA, 'spoofed-attempt'),
  ));
  await assertFails(getDoc(doc(firestore, 'student_activities/student-b')));
  await assertFails(getDoc(doc(firestore, 'quiz_attempts/attempt-b')));
});

test('a teacher can query only records assigned to their institution', async () => {
  const firestore = testEnvironment.authenticatedContext('teacher-a').firestore();
  const sameInstitutionQuery = query(
    collection(firestore, 'quiz_attempts'),
    where('institutionId', '==', institutionA),
  );
  const results = await assertSucceeds(getDocs(sameInstitutionQuery));
  assert.deepEqual(results.docs.map((snapshot) => snapshot.id), ['attempt-b']);
  await assertFails(getDoc(doc(firestore, 'quiz_attempts/attempt-c')));

  const otherTeacher = testEnvironment.authenticatedContext('teacher-b').firestore();
  await assertFails(getDoc(doc(otherTeacher, 'quiz_attempts/attempt-b')));
});

test('a user cannot assign themselves an institution or teacher role', async () => {
  const firestore = testEnvironment.authenticatedContext('student-a').firestore();
  await assertFails(updateDoc(doc(firestore, 'profiles/student-a'), { institutionId: institutionB }));
  await assertFails(setDoc(doc(firestore, 'teachers/student-a'), { institutionId: institutionA }));
});

test('quiz payload identity must match the authenticated student profile', async () => {
  const firestore = testEnvironment.authenticatedContext('student-a').firestore();
  const mismatchedName = quizAttempt('student-a', institutionA, 'spoofed-name');
  mismatchedName.alias = 'Siswa lain';
  await assertFails(setDoc(doc(firestore, 'quiz_attempts/spoofed-name'), mismatchedName));

  const wrongInstitution = quizAttempt('student-a', institutionB, 'wrong-institution');
  await assertFails(setDoc(doc(firestore, 'quiz_attempts/wrong-institution'), wrongInstitution));
});

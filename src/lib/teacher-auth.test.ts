import { describe, it, expect } from 'vitest';
import { hashPasswordWithSalt, verifyTeacherPassword } from './teacher-auth';

describe('Sistem Otorisasi dan Sandi Guru ATOMIKA', () => {
  it('menghasilkan hash SHA-256 yang valid dan konsisten', async () => {
    const salt = 'atomika_salt_v1';
    const hash = await hashPasswordWithSalt('raseli', salt);
    expect(hash).toBe('d97bdc9cfba7b55528ece8d7ec203c664fc325b63e7197d28b7285158ca73186');
  });

  it('memvalidasi sandi guru yang benar (raseli)', async () => {
    const result = await verifyTeacherPassword('raseli');
    expect(result.valid).toBe(true);
    expect(result.message).toBeUndefined();
  });

  it('menolak sandi yang salah dan menampilkan pesan yang sesuai', async () => {
    const result = await verifyTeacherPassword('salah123');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Sandi guru tidak sesuai');
  });

  it('menolak sandi kosong dan menampilkan pesan yang sesuai', async () => {
    const result = await verifyTeacherPassword('');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Sandi guru tidak sesuai');
  });
});

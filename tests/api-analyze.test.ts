import { describe, it, expect, afterEach } from 'vitest';
import { POST } from '../app/api/analyze/route';

function makeRequest(body: unknown): Request {
  return new Request('http://localhost:3000/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  delete process.env.DEMO_MODE;
  delete process.env.ANTHROPIC_API_KEY;
});

// ───────────────────────────── デモモード保護 ─────────────────────────────────
describe('DEMO_MODE=true の保護', () => {
  it('DEMO_MODE=true のとき必ず 403 を返す', async () => {
    process.env.DEMO_MODE = 'true';
    process.env.ANTHROPIC_API_KEY = 'sk-ant-fake-key'; // キーがあっても403

    const res = await POST(makeRequest({ summary: {} }));
    expect(res.status).toBe(403);

    const body = await res.json();
    expect(body.error).toContain('デモモード');
  });

  it('DEMO_MODE=true では Claude API を呼び出さない（キー不要）', async () => {
    process.env.DEMO_MODE = 'true';
    // APIキー未設定でも403が返る（Claude APIを呼ばないため）

    const res = await POST(makeRequest({ summary: { valid: false } }));
    expect(res.status).toBe(403);
  });

  it('DEMO_MODE が未設定でも ANTHROPIC_API_KEY 未設定なら 500', async () => {
    // DEMO_MODE なし、APIキーなし → 通常の 500 エラー
    const res = await POST(makeRequest({ summary: {} }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain('ANTHROPIC_API_KEY');
  });
});

// ───────────────────────────── リクエスト検証 ────────────────────────────────
describe('リクエストボディ検証', () => {
  it('不正なJSONは 400 を返す', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-fake'; // JSON検証まで到達させる
    const req = new Request('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('summary が不完全な構造は 400 を返す', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-fake';
    const res = await POST(makeRequest({ summary: { incomplete: true } }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('構造');
  });
});

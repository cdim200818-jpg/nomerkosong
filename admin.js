const SUPABASE_URL = 'https://zflmggxwprkidswowmfv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmbG1nZ3h3cHJraWRzd293bWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5OTAyOTQsImV4cCI6MjExMDU2NjI5NH0.rkl7wfIxBjIFznafCg1S_6Ir65ZwLZZIp2DI2MUWMaA';

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Cek sesi saat halaman dibuka
db.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('adminSection').classList.remove('hidden');
    loadAdminList();
  }
});

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const msg = document.getElementById('loginMsg');

  const { error } = await db.auth.signInWithPassword({ email, password });

  if (error) {
    msg.innerHTML = `<div class="message error">${error.message}</div>`;
    return;
  }

  document.getElementById('loginSection').classList.add('hidden');
  document.getElementById('adminSection').classList.remove('hidden');
  loadAdminList();
}

async function logout() {
  await db.auth.signOut();
  location.reload();
}

async function tambahNomor() {
  const negara = document.getElementById('inputNegara').value;
  const nomor = document.getElementById('inputNomor').value.trim();
  const harga = parseInt(document.getElementById('inputHarga').value);
  const msg = document.getElementById('addMsg');

  if (!nomor || !harga) {
    msg.innerHTML = '<div class="message error">Nomor dan harga wajib diisi.</div>';
    return;
  }

  const { error } = await db.from('nomor').insert([{ negara, nomor, harga }]);

  if (error) {
    msg.innerHTML = `<div class="message error">${error.message}</div>`;
    return;
  }

  msg.innerHTML = '<div class="message success">✅ Nomor berhasil ditambahkan!</div>';
  document.getElementById('inputNomor').value = '';
  document.getElementById('inputHarga').value = '';
  loadAdminList();
}

async function loadAdminList() {
  const container = document.getElementById('adminList');

  const { data, error } = await db
    .from('nomor')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    container.innerHTML = '<p class="loading">Belum ada nomor.</p>';
    return;
  }

  container.innerHTML = data.map(d => `
    <div class="admin-list-item">
      <div class="info">
        <div class="nomor-text">${d.nomor}</div>
        <div class="detail">${d.negara} · Rp ${Number(d.harga).toLocaleString('id-ID')} · ${d.status}</div>
      </div>
      <div class="actions">
        ${d.status === 'tersedia' 
          ? `<button class="btn btn-small btn-danger" onclick="tandaiTerjual(${d.id})">Terjual</button>` 
          : ''}
        <button class="btn btn-small btn-danger" onclick="hapusNomor(${d.id})">Hapus</button>
      </div>
    </div>
  `).join('');
}

async function tandaiTerjual(id) {
  await db.from('nomor').update({ status: 'terjual' }).eq('id', id);
  loadAdminList();
}

async function hapusNomor(id) {
  if (!confirm('Hapus nomor ini?')) return;
  await db.from('nomor').delete().eq('id', id);
  loadAdminList();
}
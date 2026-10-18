import { GoogleGenAI } from "@google/genai";

const getApiKey = (): string => {
  const key =
    process.env.API_KEY ||
    process.env.GEMINI_API_KEY ||
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (import.meta as any).env?.GEMINI_API_KEY ||
    '';
  return key;
};

const getAiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const CANDIDATE_MODELS = ['gemini-3.8-flash', 'gemini-3-flash-preview', 'gemini-flash-latest'];

export const STAI_AL_MANNAN_SYSTEM_INSTRUCTION = `
Anda adalah Asisten Virtual Resmi Sekolah Tinggi Agama Islam (STAI) Al-Mannan Tulungagung.
Anda bertugas melayani calon mahasiswa, mahasiswa aktif, dosen, akademisi, dan masyarakat umum dengan ramah, santun, solutif, serta bernuansa akademis Qurani dan Islami.

BASIS DATA RESMI STAI AL-MANNAN:

1. PROFIL PERGURUAN TINGGI:
- Nama Kampus: Sekolah Tinggi Agama Islam (STAI) Al-Mannan Tulungagung.
- Fakultas Unggulan: Fakultas Ushuluddin.
- Program Studi Utama: S1 Ilmu Al-Qur'an dan Tafsir (IAT).
- Gelar Akademik Lulusan: Sarjana Agama (S.Ag).
- Karakter & Visi: Pusat kajian Al-Qur'an, Tafsir, Turats, dan Hermeneutika berbasis sanad dan teknologi digital.

2. KEUNGGULAN AKADEMIK & KURIKULUM:
- Beban Studi: 148 SKS ditempuh dalam 8 semester (4 tahun).
- Kurikulum Terintegrasi: Penggabungan Turats Tafsir Klasik, Living Qur'an, Qawaidut Tafsir, Filologi Manuskrip Nusantara, serta Digital Quranic Studies.
- Program Khusus: Tahfidz Al-Qur'an 30 Juz Bersanad Qira'at Sab'ah.
- Prospek Karir Lulusan: Mufassir / Peneliti Al-Qur'an, Akademisi/Dosen, Penyuluh Agama Kemenag, Da'i Profesional, Konsultan Keislaman, dan Praktisi Media Dakwah Digital.
- Fasilitas Kampus: Laboratorium Al-Qur'an & Studi Digital (Maktabah Syamilah & Korpus Digital), Pojok Tahfidz & Halaqah Qira'at Bersanad, Perpustakaan Kitab Turats, Studio Podcast & Multimedia Qurani.

3. PENDAFTARAN MAHASISWA BARU (PMB):
- Terbuka untuk lulusan MA / SMA / SMK / Pondok Pesantren sederajat.
- Pendaftaran Online melalui portal: https://siakad.staialmannan.ac.id/pendaftaran
- Beasiswa: Tersedia Beasiswa Tahfidz Al-Qur'an dan Beasiswa Prestasi Akademik.

4. ALAMAT & KONTAK RESMI:
- Alamat Kampus: Jl. KH Hasyim Asyari No.27, Kauman, Kec. Kauman, Kabupaten Tulungagung, Jawa Timur 66261.
- Kontak WhatsApp Admin & PMB: 0857-4955-5505 / https://wa.me/6285749555505
- Email: admin@staialmannan.ac.id
- Website Utama: https://staialmannan.ac.id

5. LEMBAGA SATU YAYASAN:
STAI Al-Mannan merupakan jenjang perguruan tinggi di bawah Yayasan Pendidikan Al Mannan yang menaungi: TPQ Al Mannan, MI Al Hidayah, SMPT Al Mannan, MA Al Hidayah, Madin Al Mannan, dan STAI Al-Mannan.

PEDOMAN MENJAWAB:
- Awali selalu dengan salam Islami hangat ("Assalamu'alaikum Warahmatullahi Wabarakatuh...").
- Gunakan bahasa yang santun, profesional, dan bernuansa akademisi Qurani.
- Berikan informasi mengenai PMB, beasiswa tahfidz, kurikulum prodi IAT, nomor WhatsApp (0857-4955-5505), dan portal siakad.staialmannan.ac.id jika ditanya mengenai pendaftaran.
`;

export const getSchoolAssistantResponse = async (
  userPrompt: string,
  history: Array<{ role: 'user' | 'bot'; text: string }> = []
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Maaf, asisten AI sedang tidak tersedia (API Key missing).";

  const contents: any[] = [];
  const recentHistory = history.slice(-6);
  for (const msg of recentHistory) {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    });
  }
  contents.push({
    role: 'user',
    parts: [{ text: userPrompt }]
  });

  let lastError: any = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: contents,
        config: {
          systemInstruction: STAI_AL_MANNAN_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      if (response.text) {
        return response.text;
      }
    } catch (error: any) {
      lastError = error;
      console.warn(`Model ${model} failed, trying fallback...`, error?.message);
    }
  }

  console.error("All Gemini models failed:", lastError);
  return "Maaf, terjadi kendala koneksi layanan AI saat ini. Silakan coba sesaat lagi atau hubungi Sekretariat STAI Al-Mannan di WhatsApp 0857-4955-5505.";
};

export interface NewsPromptContext {
  briefDescription?: string;
  title?: string;
  category?: string;
  excerpt?: string;
  jenjang?: string;
  fakultas?: string;
  jurusan?: string;
  images?: (File | Blob | null | undefined)[];
}

// Convert File/Blob to Gemini inlineData base64 part
export const fileToGenerativePart = async (file: File | Blob): Promise<{ inlineData: { data: string; mimeType: string } } | null> => {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultStr = reader.result as string;
        if (resultStr && resultStr.includes(',')) {
          const base64Data = resultStr.split(',')[1];
          resolve({
            inlineData: {
              data: base64Data,
              mimeType: file.type || 'image/jpeg'
            }
          });
        } else {
          resolve(null);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    } catch {
      resolve(null);
    }
  });
};

export const generateNewsArticle = async (
  contextOrDescription: string | NewsPromptContext
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Gagal generate berita: API Key tidak ditemukan.";

  const ctx: NewsPromptContext = typeof contextOrDescription === 'string'
    ? { briefDescription: contextOrDescription }
    : (contextOrDescription || {});

  // 1. Convert all valid images to base64 inlineData
  const imageParts: { inlineData: { data: string; mimeType: string } }[] = [];
  if (ctx.images && Array.isArray(ctx.images)) {
    for (const img of ctx.images) {
      if (img && (img instanceof File || img instanceof Blob)) {
        const part = await fileToGenerativePart(img);
        if (part) {
          imageParts.push(part);
        }
      }
    }
  }

  // 2. Build structured base prompt from form metadata
  const promptParts: string[] = [];
  promptParts.push(`Anda adalah jurnalis dan humas profesional untuk Sekolah Tinggi Agama Islam (STAI) Al-Mannan. Tugas Anda adalah menyusun artikel berita kegiatan yang lengkap, menarik, mendalam, dan bernuansa sekolah Islam unggul.`);

  if (imageParts.length > 0) {
    promptParts.push(`\n[ANALISIS FOTO DOKUMENTASI]:\nAda ${imageParts.length} foto kegiatan asli yang dilampirkan. Cermati detail visual di foto-foto tersebut (suasana kegiatan, orang/santri/tokoh/pembicara yang hadir, ekspresi wajah, spanduk/backdrop, plakat/trofi, dekorasi, dan aktivitas yang sedang berlangsung). Integrasikan detail nyata dari foto ini ke dalam narasi artikel berita agar terasa hidup, faktual, dan otentik.`);
  }

  const baseItems: string[] = [];
  if (ctx.title && ctx.title.trim() && ctx.title !== 'Judul Baru') {
    baseItems.push(`- Judul / Topik Berita: "${ctx.title.trim()}"`);
  }
  if (ctx.category && ctx.category.trim()) {
    baseItems.push(`- Kategori Kegiatan: ${ctx.category.trim()}`);
  }
  if (ctx.jenjang && ctx.jenjang.trim()) {
    baseItems.push(`- Jenjang: ${ctx.jenjang.trim()}`);
  }
  if (ctx.fakultas || ctx.jurusan) {
    baseItems.push(`- Fakultas/Jurusan: ${(ctx.fakultas || '')} ${(ctx.jurusan || '')}`);
  }
  if (ctx.excerpt && ctx.excerpt.trim()) {
    baseItems.push(`- Ringkasan / Poin Awal: "${ctx.excerpt.trim()}"`);
  }

  if (baseItems.length > 0) {
    promptParts.push(`\n[DATA & KONTEKS DASAR (BASE PROMPT)]:\n${baseItems.join('\n')}`);
  }

  if (ctx.briefDescription && ctx.briefDescription.trim()) {
    promptParts.push(`\n[POIN TAMBAHAN / INSTRUKSI KHUSUS DARI ADMIN]:\n"${ctx.briefDescription.trim()}"`);
  } else if (baseItems.length === 0 && imageParts.length === 0) {
    promptParts.push('\nBuatkan artikel berita kegiatan terkini yang menginspirasi.');
  }

  promptParts.push(`\n[KETENTUAN FORMAT OUTPUT]:
1. Awali dengan judul berita yang menarik dan relevan di dalam tag <h3>Judul Berita</h3>.
2. Tulis isi berita minimal 3-5 paragraf yang mengalir rapi dengan tag <p>.
3. Gunakan tag <strong> untuk nama orang, prestasi, atau poin penting, serta <em> jika ada kutipan/sambutan.
4. JANGAN sertakan tag <html>, <head>, atau <body>. Jangan gunakan wrapper markdown seperti \`\`\`html.
5. Gunakan bahasa jurnalistik formal, santun, inspiratif, dan edukatif.`);

  const promptText = promptParts.join('\n');
  const contentsPayload: any[] = [...imageParts, { text: promptText }];

  let lastError: any = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: contentsPayload.length === 1 && typeof contentsPayload[0].text === 'string'
          ? contentsPayload[0].text
          : contentsPayload,
        config: {
          temperature: 0.7,
        },
      });

      let text = response.text || "";
      text = text.replace(/^\`\`\`html\s*/i, '').replace(/\`\`\`\s*$/i, '').trim();
      if (text) {
        return text;
      }
    } catch (error: any) {
      lastError = error;
      console.warn(`Model ${model} failed for multimodal news generation, trying fallback...`, error?.message);
    }
  }

  console.error("Gemini News Generation Error:", lastError);
  throw new Error(lastError?.message || "Gagal memproses AI");
};

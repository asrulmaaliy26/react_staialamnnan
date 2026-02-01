
import React, { useContext } from 'react';
import { useParams, Link } from 'react-router-dom';

import { fetchNewsByCategory } from '../services/api';
import { AboutData, NewsItem } from '../types';
import { Target, Flag, Award, ShieldCheck, Heart, Star, BookOpen, GraduationCap, Calendar, Users, Building, Loader2 } from 'lucide-react';
import { LevelContext } from '../App';
import { useLevelConfig } from '../hooks/useLevelConfig';

const About: React.FC = () => {
  const { section } = useParams<{ section: string }>();
  const { activeLevel } = useContext(LevelContext);
  const LEVEL_CONFIG = useLevelConfig();
  const [aboutData, setAboutData] = React.useState<AboutData | null>(null);
  const [loading, setLoading] = React.useState(true);

  // State for Prestasi
  const [prestasiData, setPrestasiData] = React.useState<NewsItem[]>([]);
  const [prestasiLoading, setPrestasiLoading] = React.useState(false);

  React.useEffect(() => {
    const loadData = () => {
      setLoading(true);
      try {
        // Construct default data locally from ENV variables
        const envVisi = import.meta.env.VITE_ABOUT_VISI || '';
        const envHistory = import.meta.env.VITE_ABOUT_HISTORY || '';
        const envMisiStr = import.meta.env.VITE_ABOUT_MISI;
        const envStrukturStr = import.meta.env.VITE_ABOUT_STRUKTUR;

        let misi: string[] = [];
        try {
          if (envMisiStr) misi = JSON.parse(envMisiStr);
        } catch (e) {
          console.error('Error parsing VITE_ABOUT_MISI', e);
        }

        let struktur = {
          pimpinan: 'Pimpinan',
          nama: '-',
          staff: []
        };
        try {
          if (envStrukturStr) struktur = JSON.parse(envStrukturStr);
        } catch (e) {
          console.error('Error parsing VITE_ABOUT_STRUKTUR', e);
        }

        const data: AboutData = {
          visi: envVisi,
          history: envHistory,
          misi,
          struktur,
        };

        setAboutData(data);
      } catch (error) {
        console.error("Failed to load about data from env", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [activeLevel]);

  // Fetch Prestasi Data when section is 'prestasi'
  React.useEffect(() => {
    if (section === 'prestasi') {
      const loadPrestasi = async () => {
        setPrestasiLoading(true);
        try {
          // Fetch raw data for category 'Prestasi'
          // Note: The category name must match exactly what is in the DB, usually 'Prestasi'
          const news = await fetchNewsByCategory('Prestasi');

          // Filter by Active Level if not UMUM
          let filtered = news;
          if (activeLevel !== 'UMUM') {
            filtered = news.filter(n => n.jenjang === activeLevel);
          }

          setPrestasiData(filtered);
        } catch (error) {
          console.error("Failed to load prestasi data", error);
          setPrestasiData([]);
        } finally {
          setPrestasiLoading(false);
        }
      };

      loadPrestasi();
    }
  }, [section, activeLevel]);

  const theme = LEVEL_CONFIG[activeLevel];
  const content = aboutData;

  const isYayasan = activeLevel === 'UMUM';

  const renderVisiMisi = () => (
    <div className="space-y-16 animate-fadeIn">
      <div className={`${theme.bg} p-6 md:p-20 rounded-[4rem] text-white relative overflow-hidden shadow-2xl transition-colors duration-500`}>
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <p className="arabic-text text-3xl md:text-5xl text-islamic-gold-500 mb-8 md:mb-10">إِنَّ اللَّهَ مَعَ الَّذِينَ اتَّقَوْا وَالَّذِينَ هُمْ مُحْسِنُونَ</p>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-[0.4em] mb-6 md:mb-8 text-islamic-gold-500/80">
            {isYayasan ? 'Visi Yayasan' : `Visi ${activeLevel}`}
          </h2>
          <p className="text-2xl md:text-5xl leading-tight font-black mb-8 md:mb-10">
            "{content.visi}"
          </p>
          <div className="h-1 w-24 bg-islamic-gold-500 mx-auto rounded-full opacity-50"></div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/islamic-art.png')]"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
        <div className="bg-white p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-xl border border-slate-50 group hover:border-slate-200 transition-all">
          <div className={`${theme.bg} w-16 h-16 rounded-2xl flex items-center justify-center mb-10 text-white shadow-inner`}>
            <Flag className="w-8 h-8" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-8">Misi Strategis</h3>
          <ul className="space-y-8">
            {content.misi.map((m: string, idx: number) => (
              <li key={idx} className="flex gap-6">
                <span className={`flex-shrink-0 w-10 h-10 rounded-2xl ${theme.bg} text-white flex items-center justify-center font-black text-sm shadow-lg`}>0{idx + 1}</span>
                <p className="text-slate-600 font-medium leading-relaxed">{m}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-islamic-gold-500 p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] text-white shadow-xl shadow-islamic-gold-100 flex flex-col justify-center overflow-hidden relative">
          <div className="relative z-10">
            <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-10 text-white shadow-xl">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-black mb-8">Nilai-Nilai Luhur</h3>
            <div className="grid grid-cols-2 gap-4">
              {['Amanah', 'Fathanah', 'Siddiq', 'Tabligh'].map(val => (
                <div key={val} className="bg-white/10 backdrop-blur-md p-4 md:p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                  <p className="font-black text-lg md:text-xl mb-1">{val}</p>
                  <div className="h-0.5 w-10 bg-white/40 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/islamic-art.png')]"></div>
        </div>
      </div>
    </div>
  );

  const renderProfil = () => (
    <div className="space-y-16 md:space-y-20 animate-fadeIn">
      <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center">
        <div className="md:w-1/2">
          <div className={`inline-flex items-center gap-2 bg-slate-50 ${theme.text} px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase mb-6`}>
            {isYayasan ? 'Sejarah Yayasan' : `Profil Lengkap ${activeLevel}`}
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 md:mb-8 leading-tight">
            {isYayasan ? 'Membangun Peradaban' : `Mencetak Generasi ${activeLevel}`} Melalui <span className={theme.text}>Pendidikan Qurani</span>.
          </h2>
          <p className="text-slate-600 leading-relaxed text-base md:text-lg mb-8 md:mb-10">
            {content.history}
          </p>
          <div className="space-y-6">
            <div className="flex items-center gap-6 bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-50 transition-transform hover:scale-[1.02]">
              <div className={`${theme.bg} p-4 rounded-2xl text-white shadow-xl flex-shrink-0`}><Award className="w-6 h-6" /></div>
              <div>
                <p className="font-black text-slate-800 text-lg leading-tight">Terakreditasi A Unggul</p>
                <p className="text-sm text-slate-500 font-medium mt-1">Sertifikasi kualitas nasional tingkat tertinggi.</p>
              </div>
            </div>
            <div className="flex items-center gap-6 bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-50 transition-transform hover:scale-[1.02]">
              <div className="bg-islamic-gold-500 p-4 rounded-2xl text-white shadow-xl flex-shrink-0"><Heart className="w-6 h-6" /></div>
              <div>
                <p className="font-black text-slate-800 text-lg leading-tight">Lingkungan Berbasis Akhlak</p>
                <p className="text-sm text-slate-500 font-medium mt-1">Pembinaan karakter harian dalam ekosistem islami.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="md:w-1/2 relative w-full">
          <div className="rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl border-[8px] md:border-[12px] border-white relative z-10">
            <img
              src={import.meta.env.VITE_ABOUT_IMAGE}
              alt="Profile"
              className="w-full h-full object-cover min-h-[300px] md:min-h-[500px]"
            />
          </div>
          <div className={`absolute -bottom-8 -right-8 w-64 h-64 ${isYayasan ? 'bg-slate-200' : 'bg-islamic-green-100'} rounded-full blur-3xl -z-10 opacity-50`}></div>
        </div>
      </div>
    </div>
  );

  const renderStruktur = () => {
    // Data Struktur Organisasi
    const dewanSenat = [
      "KH Ahmad Nasuhi",
      "Hj. Aufa Nayli Fakhrina",
      "KH Taufiq Hidayatullah, M.Pd"
    ];

    const pimpinan = {
      ketua: { role: "Ketua", name: "Dr. Farhan Masrury, S.Pd.I, M.Pd, M.Ag" },
      wakil: [
        { role: "Wakil Ketua 1", name: "Ahmad Sugeng Riady, S.Sos., M.Ag" },
        { role: "Wakil Ketua 2", name: "Latifah Zumaila Iva, M.Pd" },
        { role: "Wakil Ketua 3", name: "Fajri Kurniawan, M.Pd" }
      ]
    };

    const lembaga = [
      { role: "BAAK", name: "Fita Indriani, S.Si" },
      { role: "BAUK", name: "Qoriatul Rofiqoh, S.Pd.I" },
      { role: "LP2M", name: "Aldo Krisdianto, S.Pd., M.Pd" },
      { role: "LPM", name: "Mawlana Nabrisni Hawna, M.Pd" }
    ];

    const kaprodi = [
      { role: "MPI", name: "Audi Anugrah, S.E., S.Kom., M.Pd" },
      { role: "Studi Islam", name: "A. Riris Muldani, M.Ag" },
      { role: "Ilmu Al-Qur’an dan Tafsir", name: "Dr. Dian Erwanto, M.Ag" }
    ];

    return (
      <div className="space-y-24 animate-fadeIn text-center">
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-10 md:mb-20 relative inline-block">
          Struktur Organisasi
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-1.5 w-24 bg-islamic-gold-500 rounded-full"></div>
        </h2>

        {/* Dewan Senat */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-8">Dewan Senat</h3>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {dewanSenat.map((name, idx) => (
              <div key={idx} className="bg-white px-6 md:px-8 py-4 rounded-2xl shadow-lg border-b-4 border-slate-100 min-w-[200px] md:min-w-[250px] hover:transform hover:-translate-y-1 transition-all duration-300">
                <p className="font-bold text-slate-700 text-sm md:text-base">{name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pimpinan Kampus */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-10">Pimpinan Kampus</h3>

          {/* Ketua */}
          <div className="relative group max-w-sm mx-auto mb-10 md:mb-16">
            <div className={`${theme.bg} text-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl relative z-10 transition-transform duration-300 hover:scale-105`}>
              <div className="bg-islamic-gold-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl">
                <Building className="w-8 h-8" />
              </div>
              <p className="text-[10px] uppercase font-black text-islamic-gold-500 tracking-widest mb-2">{pimpinan.ketua.role}</p>
              <p className="text-xl md:text-2xl font-black leading-tight">{pimpinan.ketua.name}</p>
            </div>
            <div className="absolute inset-0 bg-slate-100 rounded-[3rem] translate-y-4 -z-10 group-hover:translate-y-6 transition-transform"></div>
          </div>

          {/* Wakils */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pimpinan.wakil.map((wakil, idx) => (
              <div key={idx} className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-slate-100 hover:-translate-y-1 transition-transform duration-300">
                <div className={`w-10 h-10 ${theme.bg} rounded-xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg`}>
                  <Users className="w-5 h-5" />
                </div>
                <p className={`text-[10px] uppercase font-black ${theme.text} tracking-widest mb-2`}>{wakil.role}</p>
                <p className="font-bold text-slate-800 leading-tight">{wakil.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Lembaga dan Bagian */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-10">Lembaga dan Bagian</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {lembaga.map((item, idx) => (
              <div key={idx} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300">
                <div className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center mx-auto mb-4 text-slate-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <p className="font-black text-xs text-slate-400 mb-2 uppercase tracking-wide">{item.role}</p>
                <p className="font-bold text-slate-800 text-sm">{item.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Kepala Program Studi */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-10">Kepala Program Studi</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {kaprodi.map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-xl border-t-4 border-islamic-green-500 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-islamic-green-500/5 rounded-bl-[3rem] -mr-4 -mt-4 transition-all group-hover:bg-islamic-green-500/10"></div>
                <div className="mb-4">
                  <GraduationCap className="w-8 h-8 text-islamic-green-600" />
                </div>
                <p className="text-xs font-bold text-islamic-green-600 uppercase tracking-wider mb-3">{item.role}</p>
                <p className="font-black text-slate-800 leading-tight text-lg">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPrestasi = () => {
    if (prestasiLoading) {
      return (
        <div className="flex justify-center py-20">
          <div className="flex items-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="font-medium">Memuat data prestasi...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-16 animate-fadeIn">
        {prestasiData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            {prestasiData.map(item => (
              <Link to={`/berita/${item.id}`} key={item.id} className="bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-xl border border-slate-50 hover:shadow-2xl transition-all flex flex-col group">
                <div className="flex justify-between items-start mb-8 md:mb-10">
                  <div className={`px-4 py-1.5 md:px-6 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-lg ${item.level === 'Internasional' ? 'bg-islamic-gold-500 text-white' : theme.bg + ' text-white'
                    }`}>
                    Tingkat {item.level || 'Nasional'}
                  </div>
                  <span className={`${theme.text} font-black text-lg md:text-xl italic flex items-center gap-2`}>
                    <Calendar className="w-5 h-5" /> {item.date.split(' ').pop()}
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-6 leading-tight group-hover:text-islamic-green-700 transition-colors">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium mb-8 md:mb-10 flex-grow text-sm md:text-base">{item.excerpt}</p>
                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                  <div className={`h-full ${theme.bg} w-full rounded-full`}></div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <Award className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">Belum ada catatan prestasi spesifik untuk jenjang ini.</p>
          </div>
        )}
      </div>
    );
  };

  const getSectionContent = () => {
    switch (section) {
      case 'visi-misi': return renderVisiMisi();
      case 'profil': return renderProfil();
      case 'struktur': return renderStruktur();
      case 'prestasi': return renderPrestasi();
      default: return renderProfil();
    }
  };

  if (loading || !content) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-300"></div>
      </div>
    );
  }

  const getTitle = () => {
    const context = isYayasan ? 'Yayasan' : activeLevel;
    switch (section) {
      case 'visi-misi': return `Visi & Misi ${context}`;
      case 'profil': return `Profil Lengkap ${context}`;
      case 'struktur': return `Manajemen ${context}`;
      case 'prestasi': return `Capaian Juara ${context}`;
      default: return `Tentang ${context}`;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className={`${theme.bg} py-16 md:py-24 px-4 text-center relative overflow-hidden transition-colors duration-500`}>
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-3xl md:text-6xl font-black text-white mb-6 leading-tight animate-fadeIn">{getTitle()}</h1>
          <p className="text-white/80 text-base md:text-xl font-medium animate-fadeIn">
            {isYayasan ? 'Berkhidmat untuk kemajuan pendidikan bangsa berbasis nilai Qurani' : `Mewujudkan keunggulan pendidikan pada jenjang ${theme.type}`}
          </p>
        </div>
        <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/islamic-art.png')]"></div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10 md:py-20">
        {getSectionContent()}
      </main>
    </div>
  );
};

export default About;

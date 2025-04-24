import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import NavbarNews from "@/components/NavbarNews";

// Dummy data untuk artikel berita
const newsArticles = {
  "pik-2-development": {
    title:
      "PIK 2 dalam Pembangunan Besar. Bagaimana Dampaknya pada Sektor Properti?",
    category: "Market Trends",
    date: "23 April 2023",
    author: "Kompas by Hilda B",
    image: "/featured-news.png",
    tags: ["#PIK2", "#Properti", "#Pembangunan", "#JakartaUtara"],
    content: [
      "Pantai Indah Kapuk 2 (PIK 2) telah menjadi salah satu proyek pembangunan terbesar di Jakarta dalam beberapa tahun terakhir. Dengan luas area mencapai 1.000 hektar, proyek ini diproyeksikan akan menjadi kawasan hunian dan komersial premium yang mengubah wajah Jakarta Utara.",
      "Menurut data dari Asosiasi Real Estate Indonesia (REI), nilai investasi untuk proyek PIK 2 diperkirakan mencapai Rp 150 triliun. Angka yang fantastis ini menunjukkan besarnya potensi dan dampak yang akan dihasilkan oleh proyek tersebut terhadap sektor properti secara keseluruhan.",
      '"Pembangunan PIK 2 memberikan dampak signifikan terhadap harga properti di sekitarnya," ujar Dr. Bambang Setiawan, pakar properti dari Universitas Indonesia. "Dalam dua tahun terakhir, kami mencatat kenaikan harga tanah di area sekitar PIK 2 mencapai 30-40 persen."',
      "Fenomena ini tidak hanya terjadi di sekitar lokasi proyek, tetapi juga memberikan efek riak ke berbagai wilayah di Jakarta. Pengembang properti lain mulai melirik kawasan Jakarta Utara sebagai lokasi potensial untuk proyek-proyek baru mereka.",
      "Selain itu, pembangunan infrastruktur pendukung seperti jalan tol, transportasi publik, dan fasilitas umum juga turut mendorong pertumbuhan sektor properti di kawasan tersebut. Akses yang semakin baik membuat nilai properti semakin meningkat.",
      'Namun, di balik pesatnya pembangunan dan kenaikan harga properti, muncul kekhawatiran mengenai potensi bubble properti. "Kita perlu memastikan bahwa pertumbuhan ini berkelanjutan dan didukung oleh fundamental ekonomi yang kuat," tambah Dr. Setiawan.',
      "Pemerintah sendiri telah mengambil langkah-langkah untuk mengatur pembangunan di kawasan tersebut, termasuk memastikan ketersediaan ruang terbuka hijau dan sistem drainase yang memadai untuk mencegah banjir.",
      "Bagi investor dan calon pembeli properti, PIK 2 menawarkan potensi keuntungan yang menarik. Namun, seperti halnya investasi properti lainnya, diperlukan analisis mendalam dan pertimbangan matang sebelum mengambil keputusan.",
    ],
    recommendedArticles: [
      {
        id: "market-trends-analysis",
        title:
          "Bagaimana Suku Bunga Mempengaruhi Tren Properti di Indonesia Tahun Ini?",
        category: "Market Trends",
        date: "1 minggu yang lalu",
        image: "/recommended-1.png",
      },
      {
        id: "5-faktor-yang-mempengaruhi",
        title:
          "5 Faktor yang Mempengaruhi Kenaikan Harga Properti di Perkotaan",
        category: "Insights",
        date: "1 minggu yang lalu",
        image: "/recommended-2.png",
      },
      {
        id: "policies-regulations",
        title:
          "Jenis Pajak Properti Yang Harus Diketahui Pengusaha Bisnis Properti",
        category: "Policies & Regulations",
        date: "3 jam yang lalu",
        image: "/recommended-3.png",
      },
    ],
  },
  "68-persen-tanah": {
    title: "Ketimpangan Kepemilikan: 68% Tanah Indonesia Dikuasai 1% Kelompok",
    category: "Ekonomi",
    date: "23 April 2023",
    author: "Kompas by Hilda B",
    image: "/grid-1.png",
    tags: ["#Tanah", "#Ketimpangan", "#Ekonomi", "#ReformaAgraria"],
    content: [
      "Ketimpangan distribusi tanah di Indonesia telah mencapai angka yang mengkhawatirkan. Hasil riset terbaru menunjukkan bahwa sekitar 68% tanah di Indonesia dikuasai oleh hanya 1% kelompok masyarakat luas.",
      "Data mencatat bahwa sejak 2013 hingga 2024, setidaknya terjadi 3.734 kasus konflik agraria yang melibatkan luas tanah mencapai 7,4 juta hektar, dengan dampak pada sekitar 1,9 juta keluarga. Direktur Eksekutif Konsorsium Pembaruan Agraria (KPA), Dewi Kartika, menyatakan bahwa konflik ini sebagian besar terjadi di sektor perkebunan dan kehutanan.",
      '"Reforma agraria seharusnya menjadi solusi untuk mengatasi ketimpangan kepemilikan tanah, namun implementasinya masih jauh dari harapan," ujar Dewi dalam konferensi pers di Jakarta. "Dari target redistribusi 9 juta hektar tanah hingga 2024, baru sekitar 1,5 juta hektar yang berhasil didistribusikan."',
      "Ketimpangan kepemilikan tanah ini memiliki dampak luas pada berbagai aspek kehidupan masyarakat. Dari segi ekonomi, ketimpangan ini memperkuat kesenjangan pendapatan dan kekayaan. Kelompok yang menguasai tanah luas memiliki akses lebih besar terhadap sumber daya produktif, kredit, dan pasar.",
      'Prof. Dr. Gunawan Wiradi, pakar agraria dari Institut Pertanian Bogor, menjelaskan bahwa konsentrasi kepemilikan tanah di tangan segelintir orang atau korporasi bukan fenomena baru di Indonesia. "Ini adalah warisan dari kebijakan kolonial yang kemudian diteruskan oleh berbagai kebijakan yang cenderung berpihak pada pemodal besar," jelasnya.',
      "Pemerintah sebenarnya telah mencanangkan program Reforma Agraria sebagai upaya untuk mengatasi ketimpangan ini. Program ini mencakup redistribusi tanah, legalisasi aset, pemberian akses, pemberdayaan masyarakat, dan penyelesaian konflik agraria.",
      "Namun, implementasi program ini menghadapi berbagai tantangan. Tumpang tindih klaim kepemilikan tanah, lemahnya data dan administrasi pertanahan, serta kuatnya kepentingan politik dan ekonomi menjadi hambatan utama dalam pelaksanaan reforma agraria yang efektif.",
      '"Kita membutuhkan komitmen politik yang kuat dan pendekatan yang komprehensif untuk mengatasi ketimpangan kepemilikan tanah," tegas Direktur Jenderal Penataan Agraria Kementerian ATR/BPN, Andi Tenrisau. "Ini bukan hanya masalah teknis pertanahan, tetapi juga menyangkut keadilan sosial dan kesejahteraan masyarakat."',
    ],
    recommendedArticles: [
      {
        id: "intellectual-property",
        title: "Hak Kekayaan Intelektual: Mengapa Itu Penting bagi Startup?",
        category: "Bisnis",
        date: "10 Mei 2023",
        image: "/grid-2.png",
      },
      {
        id: "buying-vs-renting",
        title: "Beli atau Sewa Properti? Ini Pertimbangan yang Harus Diketahui",
        category: "Properti",
        date: "5 Juni 2023",
        image: "/grid-3.png",
      },
      {
        id: "for-rent",
        title: "Tren Sewa Properti 2024: Harga Naik, Permintaan Stabil",
        category: "Properti",
        date: "12 Juli 2023",
        image: "/grid-4.png",
      },
    ],
  },
  "market-trends-analysis": {
    title:
      "Bagaimana Suku Bunga Mempengaruhi Tren Properti di Indonesia Tahun Ini?",
    category: "Market Trends",
    date: "16 April 2023",
    author: "Kompas by Dian Kartika",
    image: "/recommended-1.png",
    tags: ["#SukuBunga", "#Properti", "#Investasi", "#KPR"],
    content: [
      "Fluktuasi suku bunga telah menjadi salah satu faktor penentu utama dalam dinamika pasar properti di Indonesia sepanjang tahun ini. Bank Indonesia mencatat perubahan signifikan dalam kebijakan moneter yang berdampak langsung pada sektor properti tanah air.",
      "Pada awal tahun, Bank Indonesia mempertahankan suku bunga acuan pada level 5,75%, namun tekanan inflasi global dan depresiasi rupiah memaksa otoritas moneter untuk menaikkan suku bunga hingga 6,25% pada kuartal kedua. Kenaikan ini memiliki dampak berantai pada kredit pemilikan rumah (KPR) dan kredit konstruksi.",
      '"Kenaikan suku bunga sebesar 50 basis poin telah menyebabkan penurunan permintaan KPR sekitar 15% pada semester pertama tahun ini," ungkap Dr. Farid Harianto, ekonom senior dari Universitas Indonesia. "Ini terutama terasa pada segmen rumah menengah dengan harga Rp 500 juta hingga Rp 1,5 miliar."',
      "Data dari Asosiasi Real Estate Indonesia (REI) menunjukkan bahwa penjualan properti residensial mengalami kontraksi sebesar 8,7% year-on-year. Namun, menariknya, segmen properti premium dengan harga di atas Rp 3 miliar justru menunjukkan ketahanan yang lebih baik, dengan penurunan hanya 3,2%.",
      '"Pembeli properti premium cenderung kurang sensitif terhadap perubahan suku bunga karena sebagian besar transaksi dilakukan secara tunai atau dengan porsi kredit yang lebih kecil," jelas Hendra Cipta, Direktur Marketing PT Ciputra Development Tbk.',
      "Dari sisi pengembang, kenaikan suku bunga telah mendorong strategi adaptasi yang beragam. Beberapa pengembang menawarkan skema pembayaran inovatif, seperti cicilan bertahap tanpa bunga atau subsidi bunga dalam jangka waktu tertentu. Strategi ini terbukti efektif dalam mempertahankan minat pembeli di tengah tekanan suku bunga tinggi.",
      '"Kami menawarkan program \'Buy Now, Pay Later\' dengan cicilan 0% selama 24 bulan untuk proyek-proyek tertentu," kata Irwan Suryadi, Marketing Director PT Summarecon Agung Tbk. "Ini membantu kami mempertahankan momentum penjualan meskipun kondisi pasar sedang menantang."',
      "Secara geografis, dampak kenaikan suku bunga tidak merata di seluruh Indonesia. Kota-kota besar seperti Jakarta, Surabaya, dan Medan mengalami perlambatan yang lebih signifikan dibandingkan kota-kota tier dua seperti Makassar, Palembang, dan Balikpapan yang masih menunjukkan pertumbuhan positif.",
    ],
    recommendedArticles: [
      {
        id: "pik-2-development",
        title:
          "PIK 2 dalam Pembangunan Besar. Bagaimana Dampaknya pada Sektor Properti?",
        category: "Market Trends",
        date: "12 jam yang lalu",
        image: "/featured-news.png",
      },
      {
        id: "5-faktor-yang-mempengaruhi",
        title:
          "5 Faktor yang Mempengaruhi Kenaikan Harga Properti di Perkotaan",
        category: "Insights",
        date: "1 minggu yang lalu",
        image: "/recommended-2.png",
      },
      {
        id: "investment",
        title: "Investasi Properti: Peluang dan Tantangan di Tahun 2024",
        category: "Keuangan",
        date: "21 Agustus 2023",
        image: "/grid-5.png",
      },
    ],
  },
  "5-faktor-yang-mempengaruhi": {
    title: "5 Faktor yang Mempengaruhi Kenaikan Harga Properti di Perkotaan",
    category: "Insights",
    date: "16 April 2023",
    author: "Kompas by Rudi Santoso",
    image: "/recommended-2.png",
    tags: ["#HargaProperti", "#RealEstate", "#Investasi", "#Perkotaan"],
    content: [
      "Kenaikan harga properti di kawasan perkotaan Indonesia terus menunjukkan tren yang signifikan dalam beberapa tahun terakhir. Fenomena ini dipengaruhi oleh berbagai faktor kompleks yang saling berkaitan. Berikut adalah lima faktor utama yang mendorong kenaikan harga properti di perkotaan:",
      "1. Keterbatasan Lahan",
      'Faktor paling fundamental yang mempengaruhi harga properti di perkotaan adalah keterbatasan lahan. "Supply and demand menjadi hukum dasar dalam penentuan harga properti," jelas Dr. Bambang Brodjonegoro, ekonom dan mantan Menteri Keuangan. "Di kota-kota besar seperti Jakarta, Surabaya, dan Bandung, ketersediaan lahan semakin terbatas sementara permintaan terus meningkat."',
      "Data dari Colliers International menunjukkan bahwa ketersediaan lahan di Jakarta telah berkurang hingga 90% dalam 50 tahun terakhir. Kondisi ini secara alamiah mendorong harga tanah dan properti naik secara eksponensial, terutama di lokasi-lokasi strategis.",
      "2. Pertumbuhan Populasi dan Urbanisasi",
      'Indonesia mengalami laju urbanisasi yang tinggi, dengan sekitar 56% penduduk kini tinggal di perkotaan. Angka ini diproyeksikan akan mencapai 70% pada tahun 2045. "Arus urbanisasi yang masif menciptakan permintaan tinggi terhadap hunian di perkotaan," ungkap Hendra Hartono, CEO Leads Property Services.',
      "Jakarta sebagai pusat ekonomi nasional menerima sekitar 200.000 pendatang baru setiap tahunnya. Tingginya angka ini menciptakan tekanan besar pada pasokan perumahan yang tersedia, sehingga mendorong kenaikan harga.",
      "3. Perkembangan Infrastruktur",
      'Pembangunan infrastruktur baru seperti jalan tol, MRT, LRT, dan bandara secara signifikan meningkatkan nilai properti di sekitarnya. "Properti yang berlokasi dalam radius 500 meter dari stasiun MRT Jakarta mengalami kenaikan harga hingga 35% sejak pengoperasian MRT," kata Ferry Salanto, Senior Associate Director Colliers Indonesia.',
      "Fenomena ini juga terlihat di kawasan yang terhubung dengan infrastruktur baru seperti Tol Becakayu, Tol Desari, dan Bandara Internasional Yogyakarta yang baru. Aksesibilitas yang lebih baik secara langsung diterjemahkan menjadi premium harga yang lebih tinggi.",
      "4. Kebijakan Moneter dan Fiskal",
      'Kebijakan suku bunga rendah yang diterapkan selama beberapa tahun terakhir telah mendorong permintaan kredit pemilikan rumah (KPR). "Suku bunga KPR yang kompetitif, berkisar antara 5-7%, membuat properti menjadi pilihan investasi yang menarik dibandingkan instrumen investasi lainnya," jelas Adhi Moersid, ekonom dari Bank Mandiri.',
      "5. Investasi Asing dan Domestik",
      'Masuknya investasi asing ke sektor properti Indonesia, terutama dari Singapura, China, Jepang, dan Korea Selatan, turut mendorong kenaikan harga. "Investor asing melihat properti Indonesia masih relatif murah dibandingkan negara tetangga seperti Singapura atau Malaysia, dengan potensi apresiasi yang lebih tinggi," ungkap Michael Widjaja, CEO Sinar Mas Land.',
    ],
    recommendedArticles: [
      {
        id: "market-trends-analysis",
        title:
          "Bagaimana Suku Bunga Mempengaruhi Tren Properti di Indonesia Tahun Ini?",
        category: "Market Trends",
        date: "16 April 2023",
        image: "/recommended-1.png",
      },
      {
        id: "investment",
        title: "Investasi Properti: Peluang dan Tantangan di Tahun 2024",
        category: "Keuangan",
        date: "21 Agustus 2023",
        image: "/grid-5.png",
      },
      {
        id: "real-estate",
        title: "Pasar Real Estate Indonesia: Tren Pertumbuhan dan Proyeksi",
        category: "Properti",
        date: "3 September 2023",
        image: "/grid-6.png",
      },
    ],
  },
  "intellectual-property": {
    title: "Hak Kekayaan Intelektual: Mengapa Itu Penting bagi Startup?",
    category: "Bisnis",
    date: "10 Mei 2023",
    author: "Kompas by Dian Kartika",
    image: "/grid-2.png",
    tags: ["#HKI", "#Startup", "#Bisnis", "#Inovasi"],
    content: [
      "Dalam era ekonomi digital, Hak Kekayaan Intelektual (HKI) telah menjadi aset strategis yang semakin penting bagi startup dan perusahaan teknologi. Perlindungan HKI tidak lagi menjadi pilihan, tetapi kebutuhan mendasar untuk kelangsungan dan pertumbuhan bisnis.",
      '"Bagi startup, HKI seringkali merupakan aset paling berharga yang dimiliki," ungkap Dr. Cita Citrawinda, pakar hukum HKI dari Universitas Indonesia. "Tanpa perlindungan yang memadai, inovasi dan kreativitas yang menjadi jantung dari startup dapat dengan mudah diambil oleh kompetitor."',
      "Data dari Direktorat Jenderal Kekayaan Intelektual (DJKI) Kementerian Hukum dan HAM menunjukkan peningkatan signifikan dalam pendaftaran HKI oleh startup Indonesia. Pada tahun 2022, tercatat lebih dari 2.500 permohonan paten, merek, dan hak cipta yang diajukan oleh startup, meningkat 35% dibandingkan tahun sebelumnya.",
      "Namun, angka ini masih relatif kecil dibandingkan dengan jumlah startup yang ada di Indonesia yang mencapai lebih dari 2.300 perusahaan. Ini menunjukkan bahwa kesadaran akan pentingnya HKI masih perlu ditingkatkan di kalangan pelaku startup.",
      '"Banyak founder startup yang masih menganggap perlindungan HKI sebagai proses yang rumit, mahal, dan memakan waktu," jelas Andi Taufan, CEO Amartha, fintech yang telah mendaftarkan beberapa paten untuk teknologi keuangan mikro mereka. "Padahal, investasi dalam perlindungan HKI ini akan memberikan manfaat jangka panjang yang jauh lebih besar."',
      "Setidaknya ada lima alasan mengapa HKI sangat penting bagi startup:",
      "Pertama, perlindungan terhadap inovasi. Paten memberikan hak eksklusif bagi startup untuk mengeksploitasi teknologi atau proses yang mereka kembangkan, mencegah kompetitor untuk meniru tanpa izin.",
      "Kedua, membangun nilai perusahaan. Portofolio HKI yang kuat dapat meningkatkan valuasi startup secara signifikan, terutama saat mencari pendanaan dari investor atau venture capital.",
      "Ketiga, menciptakan keunggulan kompetitif. Dengan memiliki hak eksklusif atas teknologi atau merek, startup dapat membangun posisi yang unik di pasar yang sulit ditiru oleh pesaing.",
      "Keempat, membuka peluang monetisasi tambahan. HKI dapat dilisensikan kepada pihak ketiga, menciptakan aliran pendapatan tambahan tanpa harus mengembangkan produk atau layanan baru.",
      "Kelima, meningkatkan daya tarik bagi investor. Investor cenderung lebih tertarik pada startup yang telah mengamankan aset intelektual mereka, karena ini menunjukkan keseriusan dan visi jangka panjang.",
    ],
    recommendedArticles: [
      {
        id: "68-persen-tanah",
        title:
          "Ketimpangan Kepemilikan: 68% Tanah Indonesia Dikuasai 1% Kelompok",
        category: "Ekonomi",
        date: "23 April 2023",
        image: "/grid-1.png",
      },
      {
        id: "policies-regulations",
        title:
          "Jenis Pajak Properti Yang Harus Diketahui Pengusaha Bisnis Properti",
        category: "Policies & Regulations",
        date: "3 jam yang lalu",
        image: "/recommended-3.png",
      },
      {
        id: "investment",
        title: "Investasi Properti: Peluang dan Tantangan di Tahun 2024",
        category: "Keuangan",
        date: "21 Agustus 2023",
        image: "/grid-5.png",
      },
    ],
  },
  "buying-vs-renting": {
    title: "Beli atau Sewa Properti? Ini Pertimbangan yang Harus Diketahui",
    category: "Properti",
    date: "5 Juni 2023",
    author: "Kompas by Rudi Santoso",
    image: "/grid-3.png",
    tags: ["#BeliRumah", "#SewaRumah", "#InvestasiProperti", "#KPR"],
    content: [
      "Dilema antara membeli atau menyewa properti merupakan keputusan finansial besar yang dihadapi banyak orang Indonesia. Keputusan ini tidak hanya berdampak pada kondisi keuangan jangka pendek, tetapi juga berpengaruh signifikan terhadap kesejahteraan finansial jangka panjang.",
      '"Tidak ada jawaban benar atau salah dalam pilihan membeli atau menyewa properti," ujar Ligwina Hananto, perencana keuangan dan CEO QM Financial. "Keputusan ini sangat bergantung pada situasi keuangan, tujuan hidup, dan preferensi gaya hidup masing-masing individu."',
      "Dari sisi finansial, membeli properti sering dipandang sebagai investasi jangka panjang. Data dari Bank Indonesia menunjukkan bahwa harga properti residensial di kota-kota besar Indonesia mengalami kenaikan rata-rata 5-10% per tahun dalam dekade terakhir, meskipun dengan fluktuasi di beberapa periode.",
      '"Properti memiliki potensi apresiasi nilai yang signifikan dalam jangka panjang, terutama di lokasi-lokasi strategis," jelas Anton Sitorus, Head of Research Jones Lang LaSalle Indonesia. "Selain itu, kepemilikan properti juga memberikan keamanan finansial dan emosional karena Anda memiliki aset nyata yang bisa diwariskan."',
      "Namun, membeli properti juga membutuhkan komitmen finansial yang besar. Dengan harga properti yang terus meningkat, uang muka (down payment) yang dibutuhkan semakin tinggi. Untuk rumah seharga Rp 1 miliar, misalnya, dibutuhkan uang muka minimal Rp 200 juta (20%), belum termasuk biaya transaksi seperti pajak, notaris, dan biaya administrasi yang bisa mencapai 5-10% dari harga properti.",
      "\"Banyak orang terjebak dalam situasi 'house poor', di mana sebagian besar pendapatan habis untuk membayar cicilan rumah, sehingga tidak memiliki fleksibilitas keuangan untuk kebutuhan lain atau investasi diversifikasi,\" peringat Prita Ghozie, pendiri Zap Finance.",
      "Di sisi lain, menyewa properti menawarkan fleksibilitas yang lebih tinggi. Tidak ada komitmen jangka panjang, biaya awal yang lebih rendah, dan kemudahan untuk berpindah sesuai kebutuhan, seperti perubahan lokasi kerja atau ukuran keluarga.",
      '"Menyewa bisa menjadi pilihan yang lebih rasional bagi mereka yang masih dalam tahap awal karir, sering berpindah tempat kerja, atau belum yakin dengan lokasi hunian jangka panjang," kata Bambang Brodjonegoro, ekonom dan mantan Menteri Keuangan.',
    ],
    recommendedArticles: [
      {
        id: "for-rent",
        title: "Tren Sewa Properti 2024: Harga Naik, Permintaan Stabil",
        category: "Properti",
        date: "12 Juli 2023",
        image: "/grid-4.png",
      },
      {
        id: "investment",
        title: "Investasi Properti: Peluang dan Tantangan di Tahun 2024",
        category: "Keuangan",
        date: "21 Agustus 2023",
        image: "/grid-5.png",
      },
      {
        id: "real-estate",
        title: "Pasar Real Estate Indonesia: Tren Pertumbuhan dan Proyeksi",
        category: "Properti",
        date: "3 September 2023",
        image: "/grid-6.png",
      },
    ],
  },
  "for-rent": {
    title: "Tren Sewa Properti 2024: Harga Naik, Permintaan Stabil",
    category: "Properti",
    date: "12 Juli 2023",
    author: "Kompas by Hilda B",
    image: "/grid-4.png",
    tags: ["#SewaProperti", "#RealEstate", "#TrenProperti", "#Apartemen"],
    content: [
      "Pasar sewa properti di Indonesia menunjukkan dinamika menarik sepanjang tahun 2024. Meskipun harga sewa mengalami kenaikan, permintaan tetap stabil, terutama di kota-kota besar seperti Jakarta, Surabaya, dan Bandung.",
      "Berdasarkan data dari Colliers Indonesia, harga sewa apartemen di Jakarta mengalami kenaikan rata-rata sebesar 7,5% pada semester pertama 2024 dibandingkan periode yang sama tahun lalu. Sementara itu, harga sewa rumah tapak di kawasan premium naik sekitar 5-8%.",
      '"Kenaikan harga sewa ini didorong oleh beberapa faktor, termasuk inflasi, peningkatan biaya operasional dan perawatan, serta pemulihan ekonomi pasca-pandemi," jelas Ferry Salanto, Senior Associate Director Colliers Indonesia.',
      "Menariknya, meskipun harga sewa naik, tingkat hunian (occupancy rate) tetap stabil dan bahkan meningkat di beberapa kawasan. Data dari Jones Lang LaSalle (JLL) Indonesia menunjukkan bahwa tingkat hunian apartemen sewa di Jakarta mencapai 85% pada kuartal kedua 2024, naik dari 78% pada periode yang sama tahun lalu.",
      '"Ini menunjukkan bahwa permintaan terhadap properti sewa tetap kuat, meskipun harga mengalami kenaikan," ungkap Anton Sitorus, Head of Research JLL Indonesia. "Konsumen tampaknya sudah menyesuaikan ekspektasi mereka dengan kondisi pasar saat ini."',
      "Segmen pasar sewa yang paling diminati adalah apartemen dengan ukuran studio dan 1 kamar tidur di kawasan CBD Jakarta, serta rumah dengan 2-3 kamar tidur di kawasan pinggiran Jakarta seperti Bekasi, Tangerang, dan Depok. Hal ini mencerminkan preferensi konsumen yang mencari hunian dengan akses mudah ke tempat kerja atau pusat kota.",
      '"Kami melihat peningkatan permintaan dari kalangan profesional muda dan ekspatriat yang kembali bekerja di Indonesia seiring dengan pemulihan ekonomi global," kata Hendra Hartono, CEO Leads Property Services.',
      "Tren work from home yang masih berlanjut, meskipun dengan intensitas yang berkurang, juga mempengaruhi preferensi penyewa. Properti dengan ruang kerja yang memadai, koneksi internet yang stabil, dan fasilitas pendukung seperti co-working space menjadi nilai tambah yang signifikan.",
      '"Banyak penyewa sekarang mencari properti yang bisa mengakomodasi kebutuhan bekerja dari rumah, meskipun mereka sudah mulai kembali ke kantor beberapa hari dalam seminggu," jelas Siti Maryam, Marketing Director Sinarmas Land.',
    ],
    recommendedArticles: [
      {
        id: "buying-vs-renting",
        title: "Beli atau Sewa Properti? Ini Pertimbangan yang Harus Diketahui",
        category: "Properti",
        date: "5 Juni 2023",
        image: "/grid-3.png",
      },
      {
        id: "market-trends-2",
        title: "Menyingkap Area Prospek Residensial di Jakarta Barat",
        category: "Market Trends",
        date: "6 jam yang lalu",
        image: "/recommended-5.png",
      },
      {
        id: "real-estate",
        title: "Pasar Real Estate Indonesia: Tren Pertumbuhan dan Proyeksi",
        category: "Properti",
        date: "12 Juli 2023",
        image: "/grid-4.png",
      },
    ],
  },
  investment: {
    title: "Investasi Properti: Peluang dan Tantangan di Tahun 2024",
    category: "Keuangan",
    date: "21 Agustus 2023",
    author: "Kompas by Dian Kartika",
    image: "/grid-5.png",
    tags: ["#InvestasiProperti", "#RealEstate", "#Keuangan", "#ROI"],
    content: [
      "Investasi properti tetap menjadi pilihan menarik bagi investor Indonesia di tahun 2024, meskipun dihadapkan pada berbagai tantangan dan perubahan lanskap ekonomi. Para pakar menyoroti beberapa peluang dan tantangan yang perlu diperhatikan oleh investor properti di tahun ini.",
      '"Properti masih menjadi instrumen investasi yang menarik karena sifatnya yang tangible dan potensi apresiasi nilai dalam jangka panjang," ungkap Adhi Moersid, ekonom senior dari Bank Mandiri. "Namun, investor perlu lebih selektif dalam memilih jenis dan lokasi properti dibandingkan tahun-tahun sebelumnya."',
      "Dari sisi peluang, beberapa segmen properti menunjukkan prospek yang menjanjikan. Properti residensial di kawasan pinggiran kota besar dengan harga terjangkau (Rp 500 juta - Rp 1,5 miliar) masih menunjukkan permintaan yang kuat, didorong oleh kebutuhan hunian dari generasi milenial yang mulai memasuki usia produktif dan membentuk keluarga.",
      '"Kami melihat permintaan yang konsisten untuk rumah tapak dan townhouse di kawasan Bogor, Tangerang Selatan, dan Bekasi," kata Michael Widjaja, CEO Sinar Mas Land. "Segmen ini didukung oleh perbaikan infrastruktur transportasi yang menghubungkan kawasan pinggiran dengan pusat kota."',
      "Segmen lain yang menunjukkan potensi adalah properti komersial untuk logistik dan pergudangan. Pertumbuhan e-commerce yang masih kuat mendorong kebutuhan akan fasilitas logistik modern di sekitar kota-kota besar.",
      '"Permintaan untuk gudang modern dan pusat distribusi meningkat sekitar 15% year-on-year," jelas James Taylor, Head of Research Cushman & Wakefield Indonesia. "Lokasi strategis di sekitar jalan tol dan akses ke pelabuhan atau bandara menjadi incaran utama."',
      "Namun, investor juga perlu mewaspadai beberapa tantangan. Kenaikan suku bunga yang terjadi sejak akhir 2023 berdampak pada biaya pendanaan dan berpotensi menekan return on investment (ROI) properti. Bank Indonesia telah menaikkan suku bunga acuan menjadi 6,25%, yang kemudian ditranslasikan ke kenaikan suku bunga KPR dan kredit konstruksi.",
      '"Kenaikan suku bunga membuat cost of capital untuk investasi properti menjadi lebih tinggi," peringat Ryan Kiryanto, ekonom Bank Negara Indonesia. "Investor perlu melakukan kalkulasi yang lebih ketat untuk memastikan kelayakan finansial investasi mereka."',
    ],
    recommendedArticles: [
      {
        id: "5-faktor-yang-mempengaruhi",
        title:
          "5 Faktor yang Mempengaruhi Kenaikan Harga Properti di Perkotaan",
        category: "Insights",
        date: "16 April 2023",
        image: "/recommended-2.png",
      },
      {
        id: "buying-vs-renting",
        title: "Beli atau Sewa Properti? Ini Pertimbangan yang Harus Diketahui",
        category: "Properti",
        date: "5 Juni 2023",
        image: "/grid-3.png",
      },
      {
        id: "expert-opinion",
        title: "Tahun 2025: Waktu Emas untuk Berinvestasi di Properti Rumah",
        category: "Expert Opinion & Analysis",
        date: "4 jam yang lalu",
        image: "/recommended-4.png",
      },
    ],
  },
  "real-estate": {
    title: "Pasar Real Estate Indonesia: Tren Pertumbuhan dan Proyeksi",
    category: "Properti",
    date: "3 September 2023",
    author: "Kompas by Rudi Santoso",
    image: "/grid-6.png",
    tags: [
      "#RealEstate",
      "#PropertiIndonesia",
      "#InvestasiProperti",
      "#Pertumbuhan",
    ],
    content: [
      "Industri real estate Indonesia terus menunjukkan dinamika yang menarik dengan berbagai tantangan dan peluang yang mewarnai perkembangannya. Setelah mengalami tekanan selama masa pandemi, sektor ini mulai menunjukkan tanda-tanda pemulihan yang signifikan dengan pola pertumbuhan yang bervariasi di berbagai segmen dan wilayah.",
      '"Pasar real estate Indonesia sedang dalam fase transformasi," ungkap Dr. Ali Tranghanda, Executive Director Indonesia Property Watch (IPW). "Pemulihan tidak terjadi secara merata, dengan beberapa segmen dan lokasi tumbuh lebih cepat sementara yang lain masih berjuang."',
      "Data dari Bank Indonesia menunjukkan bahwa Indeks Harga Properti Residensial (IHPR) mengalami kenaikan sebesar 3,8% year-on-year pada kuartal kedua 2023, meningkat dari 2,5% pada periode yang sama tahun sebelumnya. Ini menunjukkan tren positif dalam valuasi properti secara umum.",
      "Dari segi penjualan, Survei Penjualan Properti Residensial Bank Indonesia mencatat pertumbuhan penjualan sebesar 6,2% year-on-year pada kuartal kedua 2023, didorong terutama oleh segmen rumah menengah dan menengah atas.",
      '"Pemulihan penjualan properti didukung oleh beberapa faktor, termasuk penurunan suku bunga KPR, insentif pajak dari pemerintah, dan peningkatan kepercayaan konsumen seiring dengan pemulihan ekonomi," jelas Hendra Hartono, CEO Leads Property Services.',
      "Secara geografis, pertumbuhan pasar real estate tidak merata di seluruh Indonesia. Kota-kota besar seperti Jakarta, Surabaya, dan Bandung menunjukkan pemulihan yang lebih cepat, sementara kota-kota tier dua seperti Makassar, Balikpapan, dan Palembang menunjukkan potensi pertumbuhan yang menarik dengan basis yang lebih rendah.",
      '"Kami melihat peningkatan minat investor terhadap kota-kota tier dua yang menawarkan yield yang lebih tinggi dibandingkan kota-kota besar," kata James Taylor, Head of Research Cushman & Wakefield Indonesia. "Perbaikan infrastruktur dan konektivitas membuat kota-kota ini semakin menarik."',
      "Dari segi segmen, properti residensial tetap menjadi tulang punggung pasar real estate Indonesia, menyumbang sekitar 65% dari total nilai transaksi. Dalam segmen ini, rumah tapak (landed house) dengan harga Rp 500 juta hingga Rp 2 miliar menunjukkan kinerja penjualan terbaik.",
    ],
    recommendedArticles: [
      {
        id: "investment",
        title: "Investasi Properti: Peluang dan Tantangan di Tahun 2024",
        category: "Keuangan",
        date: "21 Agustus 2023",
        image: "/grid-5.png",
      },
      {
        id: "market-trends-2",
        title: "Menyingkap Area Prospek Residensial di Jakarta Barat",
        category: "Market Trends",
        date: "6 jam yang lalu",
        image: "/recommended-5.png",
      },
      {
        id: "for-rent",
        title: "Tren Sewa Properti 2024: Harga Naik, Permintaan Stabil",
        category: "Properti",
        date: "12 Juli 2023",
        image: "/grid-4.png",
      },
    ],
  },
  "policies-regulations": {
    title:
      "Jenis Pajak Properti Yang Harus Diketahui Pengusaha Bisnis Properti",
    category: "Policies & Regulations",
    date: "3 hours ago",
    author: "Kompas by Dian Kartika",
    image: "/recommended-3.png",
    tags: ["#PajakProperti", "#BisnisProperti", "#Regulasi", "#PPh"],
    content: [
      "Bagi pengusaha yang bergerak di bidang properti, pemahaman komprehensif tentang aspek perpajakan menjadi faktor krusial yang dapat mempengaruhi profitabilitas dan kelangsungan bisnis. Sistem perpajakan properti di Indonesia cukup kompleks dengan berbagai jenis pajak yang perlu diperhatikan dalam setiap tahap transaksi dan kepemilikan properti.",
      '"Pajak properti bukan hanya beban yang harus dipenuhi, tetapi juga merupakan komponen strategis dalam perencanaan bisnis properti," ungkap Darussalam, Managing Partner DDTC Fiscal Research. "Pemahaman yang tepat dapat mengoptimalkan efisiensi pajak secara legal dan menghindari potensi sengketa pajak di kemudian hari."',
      "Berikut adalah jenis-jenis pajak utama yang perlu diketahui oleh pengusaha bisnis properti:",
      "1. Pajak Penghasilan (PPh)",
      "PPh dalam transaksi properti mencakup beberapa jenis, termasuk PPh Final dan Non-Final. Untuk pengembang properti, penghasilan dari penjualan properti dikenakan PPh Final sebesar 2,5% dari nilai transaksi. Sementara itu, untuk individu atau badan yang menjual properti, dikenakan PPh Final sebesar 2,5% dari nilai transaksi untuk tanah dan/atau bangunan non-apartemen, dan 1% untuk rumah susun sederhana.",
      '"Penting untuk memahami bahwa PPh Final bersifat final, artinya tidak dapat dikreditkan atau menjadi pengurang penghasilan kena pajak," jelas Yustinus Prastowo, pengamat perpajakan dan Direktur Eksekutif Center for Indonesia Taxation Analysis (CITA).',
      "2. Pajak Pertambahan Nilai (PPN)",
      "Penyerahan properti, baik tanah maupun bangunan, pada prinsipnya merupakan objek PPN dengan tarif 11%. Namun, terdapat pengecualian untuk rumah sederhana, rumah sangat sederhana, rumah susun sederhana, asrama mahasiswa dan pelajar, serta perumahan lainnya yang ditetapkan oleh Menteri Keuangan.",
      '"Pengusaha properti perlu memahami dengan baik kriteria properti yang dikecualikan dari PPN untuk menghindari kesalahan penerapan pajak," kata Robert Pakpahan, mantan Direktur Jenderal Pajak.',
      "3. Pajak Penjualan atas Barang Mewah (PPnBM)",
      "Untuk properti mewah seperti rumah dan apartemen dengan luas bangunan lebih dari 150 m² dan harga jual lebih dari Rp 30 miliar, dikenakan PPnBM dengan tarif 20%. Pengusaha yang menyasar segmen premium perlu memperhitungkan dampak PPnBM terhadap harga jual dan daya saing produk mereka.",
    ],
    recommendedArticles: [
      {
        id: "intellectual-property",
        title: "Hak Kekayaan Intelektual: Mengapa Itu Penting bagi Startup?",
        category: "Bisnis",
        date: "10 Mei 2023",
        image: "/grid-2.png",
      },
      {
        id: "investment",
        title: "Investasi Properti: Peluang dan Tantangan di Tahun 2024",
        category: "Keuangan",
        date: "21 Agustus 2023",
        image: "/grid-5.png",
      },
      {
        id: "market-trends-analysis",
        title:
          "Bagaimana Suku Bunga Mempengaruhi Tren Properti di Indonesia Tahun Ini?",
        category: "Market Trends",
        date: "16 April 2023",
        image: "/recommended-1.png",
      },
    ],
  },
  "expert-opinion": {
    title: "Tahun 2025: Waktu Emas untuk Berinvestasi di Properti Rumah",
    category: "Expert Opinion & Analysis",
    date: "4 hours ago",
    author: "Kompas by Rudi Santoso",
    image: "/recommended-4.png",
    tags: ["#InvestasiProperti", "#RumahTinggal", "#AnalisaProperti", "#2025"],
    content: [
      "Tahun 2025 diprediksi akan menjadi momentum emas bagi investasi properti rumah tinggal di Indonesia. Berbagai faktor ekonomi, demografis, dan regulasi diperkirakan akan menciptakan kondisi yang kondusif bagi pertumbuhan nilai properti residensial, terutama di kota-kota besar dan kawasan penyangganya.",
      '"Kami melihat adanya konvergensi beberapa faktor positif yang akan mendorong pasar properti rumah tinggal pada 2025," ungkap Dr. Ali Tranghanda, Executive Director Indonesia Property Watch (IPW). "Ini menciptakan window of opportunity yang sebaiknya dimanfaatkan oleh investor properti."',
      "Beberapa faktor utama yang mendukung prediksi ini antara lain:",
      "Pertama, proyeksi penurunan suku bunga. Bank Indonesia diperkirakan akan menurunkan suku bunga acuan secara bertahap mulai akhir 2024 hingga 2025, seiring dengan terkendalinya inflasi dan stabilnya nilai tukar rupiah.",
      '"Penurunan suku bunga akan berdampak langsung pada penurunan suku bunga KPR, yang akan meningkatkan daya beli masyarakat terhadap properti," jelas Ryan Kiryanto, ekonom Bank Negara Indonesia. "Kami memproyeksikan suku bunga KPR akan turun ke kisaran 6-7% pada 2025, dari level 8-9% saat ini."',
      "Kedua, momentum demografis yang menguntungkan. Indonesia sedang berada dalam fase bonus demografi dengan populasi usia produktif yang besar. Generasi milenial dan Gen Z yang memasuki usia produktif dan membentuk keluarga akan menciptakan permintaan baru untuk hunian.",
      '"Sekitar 64 juta milenial Indonesia akan memasuki fase peak earning dan family formation dalam 5 tahun ke depan," kata Bernardus Djonoputro, Senior Advisor Infrastructure & Territory di PwC Indonesia. "Ini akan menciptakan gelombang permintaan baru untuk properti residensial."',
      "Ketiga, perbaikan infrastruktur yang signifikan. Proyek-proyek infrastruktur besar yang saat ini sedang dibangun, seperti jaringan tol Trans Jawa, MRT Jakarta fase 2, LRT Jabodebek, dan berbagai proyek transportasi massal di kota-kota besar, diperkirakan akan selesai dan beroperasi penuh pada 2025.",
      '"Pengalaman global menunjukkan bahwa properti di sekitar infrastruktur transportasi baru biasanya mengalami kenaikan nilai yang signifikan dalam 2-3 tahun setelah infrastruktur tersebut beroperasi," jelas Anton Sitorus, Head of Research Jones Lang LaSalle Indonesia.',
    ],
    recommendedArticles: [
      {
        id: "investment",
        title: "Investasi Properti: Peluang dan Tantangan di Tahun 2024",
        category: "Keuangan",
        date: "21 Agustus 2023",
        image: "/grid-5.png",
      },
      {
        id: "market-trends-2",
        title: "Menyingkap Area Prospek Residensial di Jakarta Barat",
        category: "Market Trends",
        date: "6 jam yang lalu",
        image: "/recommended-4.png",
      },
      {
        id: "5-faktor-yang-mempengaruhi",
        title:
          "5 Faktor yang Mempengaruhi Kenaikan Harga Properti di Perkotaan",
        category: "Insights",
        date: "16 April 2023",
        image: "/recommended-2.png",
      },
    ],
  },
  "market-trends-2": {
    title: "Menyingkap Area Prospek Residensial di Jakarta Barat",
    category: "Market Trends",
    date: "6 hours ago",
    author: "Kompas by Hilda B",
    image: "/recommended-5.png",
    tags: [
      "#JakartaBarat",
      "#PropertiResidensial",
      "#InvestasiProperti",
      "#PuriIndah",
    ],
    content: [
      "Jakarta Barat telah mengalami transformasi signifikan dalam beberapa tahun terakhir, berubah dari kawasan yang didominasi industri dan pergudangan menjadi salah satu area residensial paling dinamis di ibu kota. Perkembangan infrastruktur, aksesibilitas yang meningkat, dan harga yang relatif lebih terjangkau dibandingkan Jakarta Selatan dan Jakarta Pusat menjadikan wilayah ini incaran investor dan pembeli rumah pertama.",
      '"Jakarta Barat menawarkan kombinasi menarik antara lokasi strategis, infrastruktur yang terus membaik, dan harga yang masih reasonable," ungkap Ferry Salanto, Senior Associate Director Colliers Indonesia. "Ini menjadikannya sweet spot bagi investor properti residensial."',
      "Berdasarkan data dari Rumah.com Property Index, harga properti residensial di Jakarta Barat mengalami kenaikan rata-rata 5,8% year-on-year pada kuartal pertama 2023, lebih tinggi dibandingkan rata-rata Jakarta yang sebesar 4,2%. Tren ini diperkirakan akan berlanjut seiring dengan berbagai pengembangan baru di wilayah ini.",
      "Beberapa kawasan di Jakarta Barat yang menunjukkan prospek paling menjanjikan antara lain:",
      "1. Cengkareng dan Sekitarnya",
      "Kedekatan dengan Bandara Internasional Soekarno-Hatta menjadikan Cengkareng lokasi strategis, terutama bagi profesional yang sering bepergian. Pengembangan Kota Modern Cengkareng dan berbagai cluster perumahan baru telah mengubah wajah kawasan ini.",
      '"Aksesibilitas yang semakin baik dengan adanya tol Sedyatmo dan rencana perpanjangan jalur MRT ke arah bandara akan semakin meningkatkan nilai properti di kawasan ini," jelas Hendra Hartono, CEO Leads Property Services.',
      "2. Puri Indah dan Kembangan",
      "Kawasan Puri Indah dan Kembangan telah berkembang menjadi salah satu area premium di Jakarta Barat. Dengan kehadiran mal-mal besar, fasilitas pendidikan internasional, dan rumah sakit bertaraf internasional, kawasan ini menawarkan gaya hidup urban yang lengkap.",
      "\"Puri Indah dan sekitarnya telah menjadi semacam 'South Jakarta alternative' dengan fasilitas premium namun dengan harga yang relatif lebih terjangkau,\" kata Michael Widjaja, CEO Sinar Mas Land, pengembang kawasan Puri Indah.",
    ],
    recommendedArticles: [
      {
        id: "expert-opinion",
        title: "Tahun 2025: Waktu Emas untuk Berinvestasi di Properti Rumah",
        category: "Expert Opinion & Analysis",
        date: "4 jam yang lalu",
        image: "/recommended-4.png",
      },
      {
        id: "real-estate",
        title: "Pasar Real Estate Indonesia: Tren Pertumbuhan dan Proyeksi",
        category: "Properti",
        date: "3 September 2023",
        image: "/grid-6.png",
      },
      {
        id: "market-trends-analysis",
        title:
          "Bagaimana Suku Bunga Mempengaruhi Tren Properti di Indonesia Tahun Ini?",
        category: "Market Trends",
        date: "16 April 2023",
        image: "/recommended-1.png",
      },
    ],
  },
};

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = newsArticles[slug as keyof typeof newsArticles];

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">Artikel tidak ditemukan</h1>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <NavbarNews />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb dan Navigasi Kembali */}
        <div className="mb-8">
          <Link
            href="/news"
            className="inline-flex items-center text-[#17488D] hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Berita
          </Link>
        </div>

        {/* Header Artikel */}
        <div className="mb-6">
          <div className="mb-2">
            <span className="text-[#17488D] font-semibold font-ubuntu">
              {article.category}
            </span>
            <span className="text-black ml-1"> •</span>
            <span className="text-black font-semibold text-sm ml-2">
              {article.date}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-black font-ubuntu-mono mb-4">
            {article.title}
          </h1>

          <div className="flex items-center text-sm text-gray-600 mb-4">
            <span>{article.author}</span>
          </div>

          <div className="flex space-x-4 text-sm text-[#17488D] font-extralight mb-6">
            {article.tags.map((tag, index) => (
              <span key={index}>{tag}</span>
            ))}
          </div>
        </div>

        {/* Gambar Utama */}
        <div className="mb-8">
          <Image
            src={article.image || "/placeholder.svg"}
            alt={article.title}
            width={200}
            height={200}
            className="rounded-none w-80 h-60 border-none"
          />
        </div>

        {/* Konten Artikel */}
        <div className="prose max-w-none mb-12">
          {article.content.map((paragraph, index) => (
            <p
              key={index}
              className="mb-4 text-base leading-relaxed text-gray-800"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Artikel Terkait */}
        <div className="border-t pt-8">
          <h2 className="text-xl font-bold mb-6 text-black">Artikel Terkait</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {article.recommendedArticles.map((rec) => (
              <Link href={`/news/${rec.id}`} key={rec.id} className="group">
                <div className="mb-3">
                  <Image
                    src={rec.image || "/placeholder.svg"}
                    alt={rec.title}
                    width={400}
                    height={225}
                    className="rounded-lg w-full object-cover aspect-video"
                  />
                </div>
                <div>
                  <div className="mb-1">
                    <span className="text-[#17488D] text-sm font-bold font-ubuntu">
                      {rec.category}
                    </span>
                    <span className="text-black ml-1"> •</span>
                    <span className="text-black text-xs ml-2 font-semibold">
                      {rec.date}
                    </span>
                  </div>
                  <h3 className="font-inter text-sm font-bold text-black group-hover:text-[#17488D] transition-colors">
                    {rec.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

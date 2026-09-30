import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "en" | "ar";

const STORAGE_KEY = "taktik:locale";

const en = {
  language: "العربية", library: "Library", clock: "Clock", start: "Start", back: "Back", home: "Home",
  command: "Chess command", ready: "System ready", hero1: "Your move.", hero2: "Right on time.",
  heroBody: "A precise, distraction-free clock for the board beside you. Choose a format and begin in one tap.",
  startClock: "Start clock", openLibrary: "Open library", drift: "drift", increment: "increment", private: "Private",
  activeSetup: "Active setup", blitzMatch: "Blitz match", launch: "Launch", quickLaunch: "Quick launch", presets: "Presets", formats: "4 formats",
  studyVault: "Private study vault", vaultTitle: "Books, notes, and PDFs beside the board.",
  vaultBody: "Keep opening manuals and endgame studies searchable, private, and ready to read without leaving Taktik.", enterLibrary: "Enter library",
  bullet: "Bullet", blitz: "Blitz", rapid: "Rapid", classical: "Classical", custom: "Custom", noIncrement: "No increment", fischer: "Fischer", thinkFast: "Think fast", fullFocus: "Full focus",
  signIn: "Sign in", createAccount: "Create account", authBody: "Your books and PDFs, private to your account.", continueGoogle: "Continue with Google", or: "or",
  displayName: "Display name", email: "Email", password: "Password", noAccount: "No account yet? Create one", haveAccount: "Already have an account? Sign in",
  checkEmail: "Check your email", checkEmailBody: "We sent a confirmation link to", activateLibrary: "Open it to activate your library.", backSignIn: "Back to sign in",
  myLibrary: "My library", book: "book", books: "books", signOut: "Sign out", addBook: "Add book", search: "Search title or author", searchBooks: "Search books",
  author: "Author", tag: "Tag", allAuthors: "All authors", allTags: "All tags", newest: "Newest", oldest: "Oldest", titleSort: "A–Z", loadingLibrary: "Loading your library…",
  noMatches: "No matches", emptyShelf: "Your shelf is empty", noMatchesBody: "Try a different search term or clear the filters.", emptyBody: "Add your first book and upload its PDF to start reading in the browser.", privatePdfs: "PDFs stay private to your account", unknownAuthor: "Unknown author",
  addBookBody: "Only you can see this.", title: "Title", tagsComma: "Tags (comma separated)", description: "Description", choosePdf: "Choose PDF", chooseCover: "Choose cover image", uploading: "Uploading…", saveLibrary: "Save to library", close: "Close",
  read: "Read", noPdf: "No PDF uploaded for this book.", fileSize: "File size", added: "Added", saveChanges: "Save changes", delete: "Delete", loading: "Loading…", notFoundBook: "This book could not be found.",
  reading: "Reading", noPdfAttached: "This book has no PDF attached.", preparing: "Preparing your file…", loadingViewer: "Loading viewer…", previousPage: "Previous page", nextPage: "Next page", zoomOut: "Zoom out", zoomIn: "Zoom in", pdfControls: "PDF controls", couldNotOpen: "Could not open this PDF.",
  player1: "Player 1", player2: "Player 2", flagFell: "Flag fell", tapStart: "Tap to start", paused: "Paused", yourMove: "Your move", waiting: "Waiting", moves: "moves",
  clockControls: "Clock controls", reset: "Reset game", confirmReset: "Confirm reset game", pause: "Pause game", resume: "Resume game", newGame: "Start new game", openSettings: "Open time control settings", changeControl: "Change time control", mute: "Mute sounds", unmute: "Unmute sounds", showShortcuts: "Show keyboard shortcuts", hideShortcuts: "Hide keyboard shortcuts",
  timeControl: "Time control", done: "Done", presetReset: "Choosing a preset resets the game.", minutes: "Minutes", startCustom: "Start",
  shortcuts: "Keyboard shortcuts", shortcutsBody: "Works anywhere on the clock page.", endTurn: "End your turn (on focused panel)", pauseElsewhere: "Pause / resume (elsewhere)", focusTop: "Focus top player", focusBottom: "Focus bottom player", moveControls: "Move focus in the control bar",
  gameHistory: "Game history", recentGames: "Recent games", clearHistory: "Clear history", played: "Played", avgLength: "Avg length", avgMoves: "Avg moves", noGames: "No finished games yet. Play a round to see it here.", winner: "Winner", draw: "Draw", vs: "vs",
  onboardClockTitle: "Your board. Your time.", onboardClockBody: "Choose a time control and tap a player’s clock to begin. The timer keeps running on this device, even without a connection.",
  onboardLibraryTitle: "Your private chess shelf.", onboardLibraryBody: "Sign in to keep your books and PDFs together. Search your collection and read right here in Taktik.",
  onboardCoachTitle: "Learn from every game.", onboardCoachBody: "Paste a game or your notes into the AI coach for a clear review of mistakes and ideas to try next time.", onboardCoachLabel: "AI coach",
  onboardSkip: "Skip", onboardNext: "Next", onboardFinish: "Get started", onboardProgress: "Introduction progress",
  coachTitle: "Review your game", coachBody: "Paste a PGN. Stockfish checks every move, then the coach explains your key mistakes and how to improve.", coachPlaceholder: "1. e4 e5 2. Nf3 Nc6 … (PGN or notes)", coachInputLabel: "PGN or game notes",
  coachAnalyze: "Analyze game", coachEngineRunning: "Engine checking moves…", coachWriting: "Writing review…", coachSample: "Try a sample", coachError: "Something went wrong. Please try again.",
  coachEngineTitle: "Stockfish findings", coachClean: "No significant mistakes found by the engine.", coachBest: "Best:", coachNoEngine: "Couldn't read these as legal moves, so the review is based on your notes only.",
  blunder: "Blunder", mistake: "Mistake", inaccuracy: "Inaccuracy", somethingWrong: "Something went wrong", googleFailed: "Google sign-in failed. Please try again.", namePlaceholder: "Magnus",
};

const ar: typeof en = {
  language: "English", library: "المكتبة", clock: "الساعة", start: "ابدأ", back: "رجوع", home: "الرئيسية",
  command: "مركز الشطرنج", ready: "النظام جاهز", hero1: "دورك الآن.", hero2: "في الوقت المناسب.",
  heroBody: "ساعة دقيقة بلا تشتيت، مصممة لتكون بجانب رقعة الشطرنج. اختر النمط وابدأ بلمسة واحدة.",
  startClock: "ابدأ الساعة", openLibrary: "افتح المكتبة", drift: "انحراف", increment: "إضافة", private: "خاصة",
  activeSetup: "الإعداد النشط", blitzMatch: "مباراة خاطفة", launch: "تشغيل", quickLaunch: "بدء سريع", presets: "الأوقات", formats: "٤ أنماط",
  studyVault: "خزانة دراستك الخاصة", vaultTitle: "كتب وملاحظات وملفات بجانب الرقعة.",
  vaultBody: "احتفظ بكتب الافتتاحيات والنهايات منظمة وخاصة وجاهزة للقراءة داخل تكتيك.", enterLibrary: "دخول المكتبة",
  bullet: "رصاصي", blitz: "خاطف", rapid: "سريع", classical: "كلاسيكي", custom: "مخصص", noIncrement: "دون إضافة", fischer: "فيشر", thinkFast: "فكر بسرعة", fullFocus: "تركيز كامل",
  signIn: "تسجيل الدخول", createAccount: "إنشاء حساب", authBody: "كتبك وملفاتك خاصة بحسابك.", continueGoogle: "المتابعة عبر Google", or: "أو",
  displayName: "اسم العرض", email: "البريد الإلكتروني", password: "كلمة المرور", noAccount: "ليس لديك حساب؟ أنشئ حسابًا", haveAccount: "لديك حساب؟ سجّل الدخول",
  checkEmail: "تحقق من بريدك", checkEmailBody: "أرسلنا رابط تأكيد إلى", activateLibrary: "افتحه لتفعيل مكتبتك.", backSignIn: "العودة لتسجيل الدخول",
  myLibrary: "مكتبتي", book: "كتاب", books: "كتب", signOut: "تسجيل الخروج", addBook: "إضافة كتاب", search: "ابحث بالعنوان أو المؤلف", searchBooks: "البحث في الكتب",
  author: "المؤلف", tag: "الوسم", allAuthors: "كل المؤلفين", allTags: "كل الوسوم", newest: "الأحدث", oldest: "الأقدم", titleSort: "أ–ي", loadingLibrary: "جارٍ تحميل مكتبتك…",
  noMatches: "لا توجد نتائج", emptyShelf: "رفك فارغ", noMatchesBody: "جرّب بحثًا آخر أو أزل المرشحات.", emptyBody: "أضف كتابك الأول وارفع ملفه لقراءته داخل التطبيق.", privatePdfs: "ملفاتك خاصة بحسابك", unknownAuthor: "مؤلف غير معروف",
  addBookBody: "أنت وحدك تستطيع رؤيته.", title: "العنوان", tagsComma: "الوسوم (افصل بفاصلة)", description: "الوصف", choosePdf: "اختر ملف PDF", chooseCover: "اختر صورة الغلاف", uploading: "جارٍ الرفع…", saveLibrary: "حفظ في المكتبة", close: "إغلاق",
  read: "اقرأ", noPdf: "لا يوجد ملف PDF لهذا الكتاب.", fileSize: "حجم الملف", added: "تاريخ الإضافة", saveChanges: "حفظ التغييرات", delete: "حذف", loading: "جارٍ التحميل…", notFoundBook: "تعذر العثور على هذا الكتاب.",
  reading: "قراءة", noPdfAttached: "لا يوجد ملف PDF مرفق بهذا الكتاب.", preparing: "جارٍ تجهيز الملف…", loadingViewer: "جارٍ تحميل القارئ…", previousPage: "الصفحة السابقة", nextPage: "الصفحة التالية", zoomOut: "تصغير", zoomIn: "تكبير", pdfControls: "أدوات القارئ", couldNotOpen: "تعذر فتح ملف PDF.",
  player1: "اللاعب ١", player2: "اللاعب ٢", flagFell: "انتهى الوقت", tapStart: "المس للبدء", paused: "متوقف", yourMove: "دورك", waiting: "انتظار", moves: "نقلة",
  clockControls: "أدوات الساعة", reset: "إعادة المباراة", confirmReset: "تأكيد إعادة المباراة", pause: "إيقاف المباراة", resume: "متابعة المباراة", newGame: "مباراة جديدة", openSettings: "فتح إعدادات الوقت", changeControl: "تغيير الوقت", mute: "كتم الصوت", unmute: "تشغيل الصوت", showShortcuts: "عرض اختصارات لوحة المفاتيح", hideShortcuts: "إخفاء الاختصارات",
  timeControl: "نظام الوقت", done: "تم", presetReset: "اختيار وقت جديد يعيد المباراة.", minutes: "الدقائق", startCustom: "ابدأ",
  shortcuts: "اختصارات لوحة المفاتيح", shortcutsBody: "تعمل في جميع أجزاء صفحة الساعة.", endTurn: "إنهاء دورك (عند تحديد اللاعب)", pauseElsewhere: "إيقاف أو متابعة", focusTop: "تحديد اللاعب العلوي", focusBottom: "تحديد اللاعب السفلي", moveControls: "التنقل بين أدوات التحكم",
  gameHistory: "سجل المباريات", recentGames: "المباريات الأخيرة", clearHistory: "مسح السجل", played: "المباريات", avgLength: "متوسط المدة", avgMoves: "متوسط النقلات", noGames: "لا توجد مباريات مكتملة بعد. العب مباراة لتظهر هنا.", winner: "الفائز", draw: "تعادل", vs: "ضد",
  onboardClockTitle: "رقعتك. وقتك.", onboardClockBody: "اختر نظام الوقت والمس ساعة اللاعب لتبدأ. تستمر الساعة على هذا الجهاز حتى دون اتصال بالإنترنت.",
  onboardLibraryTitle: "مكتبتك الخاصة للشطرنج.", onboardLibraryBody: "سجّل الدخول للاحتفاظ بكتبك وملفات PDF في مكان واحد. ابحث عنها واقرأها داخل تكتيك.",
  onboardCoachTitle: "تعلّم من كل مباراة.", onboardCoachBody: "ألصق مباراة أو ملاحظاتك لدى المدرب الذكي لتحصل على شرح للأخطاء وأفكار للمرة القادمة.", onboardCoachLabel: "المدرب الذكي",
  onboardSkip: "تخطي", onboardNext: "التالي", onboardFinish: "لنبدأ", onboardProgress: "تقدم المقدمة",
  coachTitle: "راجع مباراتك", coachBody: "ألصق نص PGN. يفحص محرك Stockfish كل نقلة، ثم يشرح المدرب أخطاءك الرئيسية وكيف تتحسن.", coachPlaceholder: "1. e4 e5 2. Nf3 Nc6 … (PGN أو ملاحظات)", coachInputLabel: "نص PGN أو ملاحظات المباراة",
  coachAnalyze: "حلّل المباراة", coachEngineRunning: "المحرك يفحص النقلات…", coachWriting: "جارٍ كتابة المراجعة…", coachSample: "جرّب مثالًا", coachError: "حدث خطأ ما. حاول مرة أخرى.",
  coachEngineTitle: "نتائج Stockfish", coachClean: "لم يجد المحرك أخطاء مهمة.", coachBest: "الأفضل:", coachNoEngine: "تعذرت قراءة النقلات كنقلات قانونية، لذا تعتمد المراجعة على ملاحظاتك فقط.",
  blunder: "خطأ فادح", mistake: "خطأ", inaccuracy: "عدم دقة", somethingWrong: "حدث خطأ ما", googleFailed: "فشل تسجيل الدخول عبر Google. حاول مرة أخرى.", namePlaceholder: "ماغنوس",
};

export type TranslationKey = keyof typeof en;
const dictionaries = { en, ar };

type I18nValue = { locale: Locale; dir: "ltr" | "rtl"; setLocale: (locale: Locale) => void; toggleLocale: () => void; t: (key: TranslationKey) => string };
const I18nContext = createContext<I18nValue>({ locale: "en", dir: "ltr", setLocale: () => undefined, toggleLocale: () => undefined, t: (key) => en[key] });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "ar" || saved === "en") setLocale(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);
  const value = useMemo<I18nValue>(() => ({ locale, dir: locale === "ar" ? "rtl" : "ltr", setLocale, toggleLocale: () => setLocale((v) => v === "en" ? "ar" : "en"), t: (key) => dictionaries[locale][key] }), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() { return useContext(I18nContext); }
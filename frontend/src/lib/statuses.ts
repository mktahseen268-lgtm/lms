export const SHIPMENT_STATUSES = [
  "كل الحالات",
  "فى انتظار التنفيذ",
  "في الطريق الى الفرع",
  "فى الطريق الى استلام الشحنه",
  "في المركز الرئيسي",
  "في الطريق الي منطقة التوزيع",
  "في منطقة التوزيع",
  "تم الاستلام من الراسل",
  "في الطريق إلى المخزن",
  "فى انتظار تاكيد استلام من المخزن",
  "تسليم جزئى",
  "مرتجع جزئى",
  "مرتجع في مخزن الشركه",
  "في مخزن الشركه",
  "تحت تسليم العميل",
  "تسليم ناجح",
  "مرتجع الغاء",
  "رفض و رفض دفع تكلفة",
  "رفض و دفع تكلفة",
  "ملغيه",
  "مرتجع في المخزن",
  "رفض و دفع فى منطقة التوزيع",
  "مؤجل (مع المندوب)",
  "مؤجل (فى المخزن)",
  "تم التوريد",
  "مشكلة تسليم",
];

export const STATUS_LABEL_EN: Record<string, string> = {
  "كل الحالات": "All statuses",
  "فى انتظار التنفيذ": "Pending",
  "في الطريق الى الفرع": "On the way to branch",
  "فى الطريق الى استلام الشحنه": "On the way to pickup",
  "في المركز الرئيسي": "At main center",
  "في الطريق الي منطقة التوزيع": "On the way to distribution",
  "في منطقة التوزيع": "At distribution zone",
  "تم الاستلام من الراسل": "Picked up from sender",
  "في الطريق إلى المخزن": "On the way to warehouse",
  "فى انتظار تاكيد استلام من المخزن": "Awaiting warehouse confirmation",
  "تسليم جزئى": "Partial delivery",
  "مرتجع جزئى": "Partial return",
  "مرتجع في مخزن الشركه": "Returned to company warehouse",
  "في مخزن الشركه": "At company warehouse",
  "تحت تسليم العميل": "Out for customer delivery",
  "تسليم ناجح": "Delivered",
  "مرتجع الغاء": "Cancellation return",
  "رفض و رفض دفع تكلفة": "Refused without fee",
  "رفض و دفع تكلفة": "Refused with fee",
  "ملغيه": "Cancelled",
  "مرتجع في المخزن": "Returned at warehouse",
  "رفض و دفع فى منطقة التوزيع": "Refused & paid at distribution",
  "مؤجل (مع المندوب)": "Postponed (with courier)",
  "مؤجل (فى المخزن)": "Postponed (in warehouse)",
  "تم التوريد": "Supplied",
  "مشكلة تسليم": "Delivery problem",
};

export function localizeStatus(status: string, lang: string) {
  if (lang === "en") return STATUS_LABEL_EN[status] || status;
  return status;
}

export const STATUS_COLOR: Record<string, string> = {
  "فى انتظار التنفيذ": "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  "تسليم ناجح": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  "ملغيه": "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
  "مشكلة تسليم": "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
  "تحت تسليم العميل": "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  "في الطريق الي منطقة التوزيع": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
};

export function statusBadge(status: string) {
  return STATUS_COLOR[status] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
}

export const EG_PROVINCES = [
  "القاهرة","الجيزة","الإسكندرية","الدقهلية","الشرقية","القليوبية","المنوفية","الغربية",
  "كفر الشيخ","البحيرة","الإسماعيلية","السويس","بورسعيد","دمياط","شمال سيناء","جنوب سيناء",
  "الفيوم","بني سويف","المنيا","أسيوط","سوهاج","قنا","الأقصر","أسوان","البحر الأحمر","الوادي الجديد","مطروح","حلوان","6 أكتوبر",
];

export const EG_PROVINCES_EN = [
  "Cairo","Giza","Alexandria","Dakahlia","Sharqia","Qalyubia","Monufia","Gharbia",
  "Kafr el-Sheikh","Beheira","Ismailia","Suez","Port Said","Damietta","North Sinai","South Sinai",
  "Faiyum","Beni Suef","Minya","Asyut","Sohag","Qena","Luxor","Aswan","Red Sea","New Valley","Matrouh","Helwan","6th of October",
];

export function localizeProvince(province: string, lang: string) {
  if (lang === "en") {
    const i = EG_PROVINCES.indexOf(province);
    if (i >= 0) return EG_PROVINCES_EN[i];
  }
  return province;
}

import { useSettingsStore, type Locale } from "./settingsStore";
import type { ItemType } from "@/types/item";

const en = {
  "app.name": "TodoCL",
  "itemType.todo": "To Do",
  "itemType.topay": "To Pay",
  "itemType.tobuy": "To Buy",
  "itemType.tothink": "To Think",
  "nav.home": "Home",
  "nav.calendar": "Calendar",
  "nav.settings": "Settings",
  "nav.backHome": "Back to home",
  "summary.total": "Total",
  "summary.done": "Done",
  "summary.remaining": "Remaining",
  "quickAdd.itemName": "Item name",
  "quickAdd.addTask": "Add a task",
  "quickAdd.amount": "Amount",
  "quickAdd.setDate": "Set date",
  "quickAdd.setTime": "Set time (alarm)",
  "quickAdd.date": "Date",
  "quickAdd.time": "Time",
  "quickAdd.add": "Add",
  "item.check": "Check",
  "item.uncheck": "Uncheck",
  "item.delete": "Delete",
  "item.deleted": "Deleted",
  "item.undo": "Undo",
  "empty.todo": "Add a task",
  "empty.tobuy": "Add something to buy",
  "empty.topay": "Add something to pay",
  "empty.tothink": "Add something to think about",
  "notification.prompt": "Turn on notifications to get reminders while the app is open",
  "notification.enable": "Enable",
  "notification.dismiss": "Dismiss",
  "alarm.reminder": "reminder",
  "calendar.weekday.0": "Sun",
  "calendar.weekday.1": "Mon",
  "calendar.weekday.2": "Tue",
  "calendar.weekday.3": "Wed",
  "calendar.weekday.4": "Thu",
  "calendar.weekday.5": "Fri",
  "calendar.weekday.6": "Sat",
  "calendar.noItems": "No items due this day",
  "calendar.prevMonth": "Previous month",
  "calendar.nextMonth": "Next month",
  "settings.title": "Settings",
  "settings.language": "Language",
  "settings.calendarCategories": "Categories shown on Calendar",
  "settings.calendarCategoriesHint": "Choose which lists appear when you tap a day on the Calendar.",
  "settings.premium": "Premium",
  "premium.title": "Premium feature",
  "premium.desc": "Unlock the Calendar and due-date reminders.",
  "premium.unlock": "Unlock Premium",
  "premium.active": "Premium active",
} satisfies Record<string, string>;

type Dict = Record<keyof typeof en, string>;
export type TranslationKey = keyof typeof en;

const ko: Dict = {
  "app.name": "TodoCL",
  "itemType.todo": "할 일",
  "itemType.topay": "낼 돈",
  "itemType.tobuy": "살 것",
  "itemType.tothink": "생각할 것",
  "nav.home": "홈",
  "nav.calendar": "캘린더",
  "nav.settings": "설정",
  "nav.backHome": "홈으로",
  "summary.total": "전체",
  "summary.done": "완료",
  "summary.remaining": "남은 금액",
  "quickAdd.itemName": "품목명",
  "quickAdd.addTask": "할 일 입력",
  "quickAdd.amount": "금액",
  "quickAdd.setDate": "날짜 설정",
  "quickAdd.setTime": "시간(알람) 설정",
  "quickAdd.date": "날짜",
  "quickAdd.time": "시간",
  "quickAdd.add": "추가",
  "item.check": "체크",
  "item.uncheck": "체크 해제",
  "item.delete": "삭제",
  "item.deleted": "삭제됨",
  "item.undo": "되돌리기",
  "empty.todo": "할 일을 추가해보세요",
  "empty.tobuy": "살 것을 추가해보세요",
  "empty.topay": "낼 돈을 추가해보세요",
  "empty.tothink": "생각할 것을 추가해보세요",
  "notification.prompt": "앱이 열려 있을 때 알림을 받으려면 알림을 켜주세요",
  "notification.enable": "알림 켜기",
  "notification.dismiss": "닫기",
  "alarm.reminder": "알림",
  "calendar.weekday.0": "일",
  "calendar.weekday.1": "월",
  "calendar.weekday.2": "화",
  "calendar.weekday.3": "수",
  "calendar.weekday.4": "목",
  "calendar.weekday.5": "금",
  "calendar.weekday.6": "토",
  "calendar.noItems": "이 날에는 일정이 없어요",
  "calendar.prevMonth": "이전 달",
  "calendar.nextMonth": "다음 달",
  "settings.title": "설정",
  "settings.language": "언어",
  "settings.calendarCategories": "캘린더에 표시할 카테고리",
  "settings.calendarCategoriesHint": "캘린더에서 날짜를 눌렀을 때 보여줄 목록을 선택하세요.",
  "settings.premium": "프리미엄",
  "premium.title": "프리미엄 기능",
  "premium.desc": "캘린더와 마감일 알림을 잠금 해제하세요.",
  "premium.unlock": "프리미엄 잠금 해제",
  "premium.active": "프리미엄 이용 중",
};

const DICTS: Record<Locale, Dict> = { en, ko };

export function useLocale(): Locale {
  return useSettingsStore((state) => state.locale);
}

export function useT() {
  const locale = useLocale();
  return (key: TranslationKey) => DICTS[locale][key];
}

export function translate(locale: Locale, key: TranslationKey): string {
  return DICTS[locale][key];
}

export function formatOpenCount(n: number, locale: Locale): string {
  return locale === "ko" ? `${n}개 남음` : `${n} open`;
}

export const ITEM_TYPE_TRANSLATION_KEY: Record<ItemType, TranslationKey> = {
  todo: "itemType.todo",
  topay: "itemType.topay",
  tobuy: "itemType.tobuy",
  tothink: "itemType.tothink",
};

export const ITEM_TYPE_EMPTY_KEY: Record<ItemType, TranslationKey> = {
  todo: "empty.todo",
  topay: "empty.topay",
  tobuy: "empty.tobuy",
  tothink: "empty.tothink",
};

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 프로토타입용 최소 i18n 초기화.
// TDS 내부에서 useTranslation을 호출하는 컴포넌트가 크래시하지 않도록 보장한다.
void i18n.use(initReactI18next).init({
  lng: 'ko',
  fallbackLng: 'ko',
  resources: { ko: { translation: {} } },
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;

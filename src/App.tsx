import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import OverviewLanding from './components/OverviewLanding';

const LegacyApp = lazy(() => import('./LegacyApp'));
const ThankYou = lazy(() => import('./components/ThankYou'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const QuoteExport = lazy(() => import('./components/QuoteExport'));
const EmbedPricing = lazy(() => import('./components/EmbedPricing'));

export default function App() {
  return <BrowserRouter><Suspense fallback={<div role="status" style={{ padding: 32, fontFamily: 'sans-serif' }}>Đang tải trang...</div>}><Routes>
    <Route path="/" element={<OverviewLanding />} />
    <Route path="/du-hoc-han-quoc" element={<OverviewLanding />} />
    <Route path="/thank-you" element={<ThankYou />} />
    <Route path="/chinh-sach-bao-mat" element={<PrivacyPolicy />} />
    <Route path="/xuat-bao-gia" element={<QuoteExport />} />
    <Route path="/boc-tach" element={<LegacyApp />} />
    <Route path="/embed/:universityId" element={<EmbedPricing />} />
  </Routes></Suspense></BrowserRouter>;
}

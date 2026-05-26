import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SurveyPage } from './pages/SurveyPage';
import { ThanksPage } from './pages/ThanksPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NotFound } from './components/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/s/:slug" element={<SurveyPage />} />
        <Route path="/s/:slug/thanks" element={<ThanksPage />} />
        <Route path="/a/:slug" element={<AnalyticsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Overview from './pages/Overview';
import Farewell from './pages/Farewell';
import Cremation from './pages/Cremation';
import Columbarium from './pages/Columbarium';
import Services from './pages/Services';
import Reports from './pages/Reports';

export default function App() {
  return (
    <Router>
      <div className="h-screen w-screen flex flex-col bg-slate-950 text-white overflow-hidden">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/farewell" element={<Farewell />} />
              <Route path="/cremation" element={<Cremation />} />
              <Route path="/columbarium" element={<Columbarium />} />
              <Route path="/services" element={<Services />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

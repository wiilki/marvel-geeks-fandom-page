import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div >
        <header>
          {/* header content */}
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </main>
        <footer>
          <Footer />
        </footer>
      </div>
    </Router>
  );
}

export default App;

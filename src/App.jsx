import Header from './components/Header';
import Hero from './components/Hero';
import Work from './components/Work';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <Hero />
        <Work />
      </main>
      <Footer />
    </div>
  );
}

export default App;

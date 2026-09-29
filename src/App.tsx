import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { Marquee } from './components/Marquee';
import { LiveCalendar } from './components/LiveCalendar';
import { Clips } from './components/Clips';
import { PhotoWall } from './components/PhotoWall';
import { FanWall } from './components/FanWall';
import { StarMessages } from './components/StarMessages';
import { Footer } from './components/Footer';

export function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <LiveCalendar />
        <Clips />
        <PhotoWall />
        <FanWall />
        <StarMessages />
      </main>
      <Footer />
    </>
  );
}

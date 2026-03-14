import Navbar from '@/components/layout/Navbar'
import SnowfallCanvas from '@/components/layout/SnowfallCanvas'
import SabrinaFAB from '@/components/layout/SabrinaFAB'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#020918',
        position: 'relative',
      }}
    >
      {/* Animated background aurora */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(ellipse at 15% 30%, rgba(70,160,255,0.06) 0%, transparent 55%), radial-gradient(ellipse at 85% 70%, rgba(125,219,255,0.05) 0%, transparent 50%), radial-gradient(ellipse at 50% 10%, rgba(70,100,255,0.04) 0%, transparent 40%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <SnowfallCanvas />
      <Navbar />

      <main
        style={{
          paddingTop: '80px',
          paddingBottom: '40px',
          paddingLeft: '24px',
          paddingRight: '24px',
          maxWidth: '1280px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </main>

      <SabrinaFAB />
    </div>
  )
}

import { ColoresProvider } from '@/context/ColoresContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ColoresProvider>
          {children}
        </ColoresProvider>
      </body>
    </html>
  );
}
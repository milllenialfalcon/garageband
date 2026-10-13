export const viewport = { width: "device-width", initialScale: 1, userScalable: false };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <img
          src="/logo.svg"
          width={120}
        />
        {children}
      </body>
    </html>
  );
}

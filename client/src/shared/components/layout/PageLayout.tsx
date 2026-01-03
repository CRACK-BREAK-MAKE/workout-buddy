import { ReactNode } from 'react';
import { Header, HeaderProps } from './Header';
import { Footer } from './Footer';

export interface PageLayoutProps extends HeaderProps {
  children: ReactNode;
}

export const PageLayout = ({ children, ...headerProps }: PageLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header {...headerProps} />
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
};

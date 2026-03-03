// import { TransitionLink } from '@/features/transitionNavigate';
// import { LogoImage } from '@/shared/components/icons-logo';
// import { PUBLIC_ROUTE } from '@/shared/constants';

import { TransitionLink } from "@/features/transitionNavigate/components/TransitionLink";
import { PUBLIC_ROUTE } from "../constants/routes/public.constant";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-primary px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Dev Nest Logo */}
        <div className="mb-8">
          {/* <LogoImage
            className="mx-auto drop-shadow-lg"
            style={{ height: 'auto' }}
            width={120}
            height={120}
          /> */}
        </div>

        {/* 404 Text */}
        <div className="mb-8">
          <h1 className="text-7xl animate-pulse  font-bold text-secondary mb-4 drop-shadow-md">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-primary-foreground mb-3">
            ไม่พบหน้าที่คุณต้องการ
          </h2>
          <p className="text-primary-foreground/80 text-lg leading-relaxed">
            หน้าที่คุณกำลังมองหาอาจถูกย้าย หรือไม่มีอยู่จริง
          </p>
        </div>

        {/* Suggestions */}
        <div className="mb-8">
          <p className="text-primary-foreground/70 mb-5 font-medium">
            ลองดูหน้าเหล่านี้แทน:
          </p>
          <div className="space-y-3">
            <TransitionLink
              to={PUBLIC_ROUTE.HOME}
              className="block w-full bg-secondary text-secondary-foreground font-semibold py-3 px-6 rounded-lg hover:bg-secondary/90 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              🏠 กลับหน้าหลัก
            </TransitionLink>
            {/* <TransitionLink
              to={PUBLIC_ROUTE.COURSES.ALL.PAGE(1)}
              className="block w-full bg-card/10 text-primary-foreground font-semibold py-3 px-6 rounded-lg hover:bg-card/20 transition-all duration-200 transform hover:scale-105 border border-primary-foreground/20 backdrop-blur-sm shadow-md hover:shadow-lg"
            >
              📚 ดูคอร์สเรียน
            </TransitionLink>
            <TransitionLink
              to={PUBLIC_ROUTE.CONTACT}
              className="block w-full bg-card/10 text-primary-foreground font-semibold py-3 px-6 rounded-lg hover:bg-card/20 transition-all duration-200 transform hover:scale-105 border border-primary-foreground/20 backdrop-blur-sm shadow-md hover:shadow-lg"
            >
              📞 ติดต่อเรา
            </TransitionLink> */}
          </div>
        </div>

        {/* Contact info
        <div className="text-primary-foreground/60 text-sm bg-card/5 rounded-lg p-4 backdrop-blur-sm border border-primary-foreground/10">
          <p className="font-medium mb-1">หากยังคงมีปัญหา สามารถติดต่อเราได้</p>
          <p className="text-secondary font-semibold">
            📧 info@devnestschool.com
          </p>
        </div> */}
      </div>
    </div>
  );
}

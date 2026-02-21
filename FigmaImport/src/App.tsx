import { RouterProvider } from 'react-router';
import { router } from './routes';
import { PhoneFrame } from './components/PhoneFrame';

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0a0a0f] via-[#16161f] to-[#1a1a2e]">
      <PhoneFrame>
        <RouterProvider router={router} />
      </PhoneFrame>
    </div>
  );
}

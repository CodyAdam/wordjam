import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import MajesticonsClipboardCopy from './svg/MajesticonsClipboardCopy';

export default function LoginCredModal(props: { onClick: () => void; onLogout: () => void }) {
  const token = localStorage.getItem('token');
  if (!token) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='absolute z-20 flex h-full w-full items-center justify-center bg-black/20 p-2 backdrop-blur-sm'
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        className='flex max-w-sm flex-col gap-4 rounded-2xl border-b-8 border-gray-200 bg-white p-10 shadow-xl'
      >
        <div className='text-xl font-bold'>Login credential</div>
        <p>
          You can use this code to login to your account on other devices.
          <b> Make sure to keep it</b>
        </p>
        <div className='flex gap-4'>
          <input
            value={token}
            readOnly
            className='focus:shadow-outline font-mono w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 focus:outline-none'
          />
          <button
            onClick={() => {
              toast.success('Copied to clipboard');
              navigator.clipboard.writeText(token);
            }}
            className='flex items-center justify-center rounded-md bg-blue-100 p-2 text-xl font-bold text-blue-800 transition-colors hover:bg-blue-200 active:bg-blue-300 active:text-blue-500'
          >
            <MajesticonsClipboardCopy className='h-6 w-6' />
          </button>
        </div>
        <button
          onClick={props.onClick}
          className='w-full rounded-md bg-slate-200 p-2 text-xl font-bold text-slate-800 transition-colors hover:bg-slate-300'
        >
          Close
        </button>
        <button onClick={props.onLogout} className='w-full text-center text-sm text-red-400 hover:text-red-600'>
          Click here to <b>logout</b>
        </button>
      </motion.div>
    </motion.div>
  );
}

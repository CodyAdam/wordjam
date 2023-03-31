import { motion } from 'framer-motion';

export default function TokenModal(props: { onClick: () => void }) {
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
        className='space-y-4 rounded-lg bg-white p-10 shadow'
      >
        <div className='text-xl font-bold'>Your token</div>
        <input
          disabled
          value={token}
          className='focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none'
        ></input>
        <button
          onClick={props.onClick}
          className='w-full rounded-md bg-green-400 p-2 text-xl font-bold text-white transition-colors hover:bg-green-500'
        >
          Done
        </button>
      </motion.div>
    </motion.div>
  );
}

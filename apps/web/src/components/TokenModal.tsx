import { motion } from "framer-motion";

export default function TokenModal(props: { value: string, onClick: () => void }) {
  return <motion.div initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="absolute p-2 bg-black/20 backdrop-blur-sm w-full h-full z-20 flex justify-center items-center">
    <motion.div initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="rounded-lg bg-white p-10 shadow space-y-4">
      <div className="text-xl font-bold">Your token</div>
      <input disabled value={props.value}
             className="focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none"></input>
      <button onClick={props.onClick}
              className="w-full rounded-md bg-green-400 p-2 text-xl font-bold text-white transition-colors hover:bg-green-500">
        Done
      </button>
    </motion.div>
  </motion.div>;
}

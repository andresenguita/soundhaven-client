import { motion, AnimatePresence } from "framer-motion";

type ToastProps = {
  message: string;
  show: boolean;
};

export default function Toast({ message, show }: ToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="toast"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="fixed top-6 left-6 bg-emerald-700 text-white px-6 py-3 rounded-xl shadow-xl z-50 text-base font-semibold"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// src/components/PageTransition.jsx
import { motion } from "framer-motion";

const variants = {
  initial: { opacity: 0, y: "100%" },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,           // enter — ちょっと slower for smoothness
      ease: [0.55, 0, 1, 0.45], // ease-out expo — fast start, gentle finish
    },
  },
  exit: {
    opacity: 0,
    y: "-100%",
    transition: {
      duration: 0.5,           // exit — very fast, snappy
      ease: [0.55, 0, 1, 0.45], // ease-in — slow start, fast end
    },
  },
};

export default function PageTransition({ children }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        width: "100%",
        minHeight: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        overflowY: "auto",
      }}
    >
      {children}
    </motion.div>
  );
}
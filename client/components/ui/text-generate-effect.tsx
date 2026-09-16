"use client";
import { type ElementType, useEffect } from "react";
import { motion, stagger, useAnimate } from "motion/react";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
  containerClassName,
  wordClassName,
  filter = true,
  duration = 0.5,
  staggerDelay = 0.08,
  startDelay = 0,
  as: Component = "div",
}: {
  words: string;
  className?: string;
  containerClassName?: string;
  wordClassName?: string;
  filter?: boolean;
  duration?: number;
  staggerDelay?: number;
  startDelay?: number;
  as?: ElementType;
}) => {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");

  useEffect(() => {
    animate(
      "span",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
      },
      {
        duration: duration ? duration : 1,
        delay: stagger(staggerDelay, { startDelay }),
      }
    );
  }, [animate, duration, filter, staggerDelay, startDelay]);

  const renderWords = () => {
    return (
      <motion.span ref={scope} className={cn("inline-block", containerClassName)}>
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              className={cn("mr-[0.25em] inline-block opacity-0", wordClassName)}
              style={{
                filter: filter ? "blur(10px)" : "none",
              }}
            >
              {word}
              {idx < wordsArray.length - 1 ? "\u00A0" : ""}
            </motion.span>
          );
        })}
      </motion.span>
    );
  };

  return (
    <Component className={cn("font-bold", className)}>{renderWords()}</Component>
  );
};

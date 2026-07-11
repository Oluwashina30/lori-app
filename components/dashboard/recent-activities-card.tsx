"use client";

import { motion } from "framer-motion";
import { Card, CardTitle } from "@/components/ui/card";
import { CircleDollarSignIcon } from "@/components/icons";
import { formatSignedCurrency } from "@/lib/utils";
import type { ActivityItem } from "@/lib/types";

export interface RecentActivitiesCardProps {
  activities: ActivityItem[];
  className?: string;
}

function ActivityIcon({ icon }: { icon: ActivityItem["icon"] }) {
  if (icon === "youtube") {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- small local static brand icon (background baked into the asset), optimization unnecessary */}
        <img src="/icons/youtube.svg" alt="" width={36} height={36} aria-hidden />
      </span>
    );
  }
  if (icon === "spotify") {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- small local static brand icon (background baked into the asset), optimization unnecessary */}
        <img src="/icons/spotify.svg" alt="" width={36} height={36} aria-hidden />
      </span>
    );
  }
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center">
      <CircleDollarSignIcon className="h-9 w-9 text-foreground" aria-hidden />
    </span>
  );
}

const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

export function RecentActivitiesCard({ activities, className }: RecentActivitiesCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      <Card>
        <CardTitle>Recent Activities</CardTitle>

        <motion.ul
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="mt-5 flex flex-col gap-1"
        >
          {activities.map((activity) => (
            <motion.li
              variants={itemVariants}
              key={activity.id}
              className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 -mx-2 transition-colors duration-200 hover:bg-white/[0.03]"
            >
              <div className="flex items-center gap-3">
                <ActivityIcon icon={activity.icon} />
                <div>
                  <p className="text-[15px] text-foreground">{activity.name}</p>
                  <p className="text-[13px] text-muted-dim">{activity.date}</p>
                </div>
              </div>
              <span
                className={
                  activity.type === "income"
                    ? "text-[15px] font-medium text-positive"
                    : "text-[15px] font-medium text-negative"
                }
              >
                {formatSignedCurrency(activity.type === "income" ? activity.amount : -activity.amount)}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </Card>
    </motion.div>
  );
}

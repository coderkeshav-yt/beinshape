
"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function TubelightNavBar({ items, className }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0].name)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  useEffect(() => {
    const currentPath = window.location.pathname
    const activeItem = items.find(item => item.url === currentPath)
    if (activeItem) {
      setActiveTab(activeItem.name)
    }
  }, [items])

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "fixed top-6 left-1/2 -translate-x-1/2 z-30",
        className,
      )}
    >
      <div className="flex items-center justify-between bg-white/95 dark:bg-gray-900/95 border border-gray-200/30 dark:border-gray-700/30 backdrop-blur-xl py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 w-full max-w-2xl mx-auto">
        {items.map((item, index) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              to={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-4 py-2 rounded-full transition-all duration-300 font-dejanire flex items-center gap-2 whitespace-nowrap",
                "text-gray-700 dark:text-gray-300 hover:text-[#e3bd30] hover:bg-[#e3bd30]/5",
                isActive && "text-[#e3bd30] bg-[#e3bd30]/10",
                "px-3 py-1 text-center"
              )}
            >
              <span className="hidden lg:inline relative z-10 select-none">{item.name}</span>
              <span className="lg:hidden relative z-10 flex items-center justify-center">
                <Icon size={16} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-[#e3bd30]/20 to-[#f4d03f]/20 rounded-full border border-[#e3bd30]/30"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </motion.div>
  )
}

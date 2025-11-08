'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useStaggerContainer } from '../../hooks/useScrollAnimation';
import { Linkedin, Mail } from 'lucide-react';

export type TeamMember = {
  id: string;
  name: string;
  position: string;
  bio: string;
  image?: string | null;
  email?: string;
  linkedin?: string;
};

type TeamGridProps = {
  members: TeamMember[];
};

export function TeamGrid({ members }: TeamGridProps) {
  const { ref, motionProps, itemVariants } = useStaggerContainer(members.length, 0.1);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <motion.div ref={ref} {...motionProps} className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {members.map((member, index) => {
        const isHovered = hoveredId === member.id;

        return (
          <motion.div
            key={member.id}
            variants={itemVariants}
            onHoverStart={() => setHoveredId(member.id)}
            onHoverEnd={() => setHoveredId(null)}
            whileHover={{ y: -8 }}
            className="group cursor-pointer"
          >
            <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-slate-900/60 hover:border-blue-500/30 transition-all shadow-xl hover:shadow-2xl hover:shadow-blue-500/10">
              {/* Image */}
              <div className="aspect-[4/5] overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-6xl font-bold text-slate-700">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                )}

                {/* Overlay with bio - appears on hover */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: isHovered ? 1 : 0,
                    y: isHovered ? 0 : 20,
                  }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-6 flex flex-col justify-end"
                >
                  <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    {member.bio}
                  </p>

                  {/* Social links */}
                  <div className="flex gap-3">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="p-2 rounded-full bg-white/10 hover:bg-blue-500/50 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Mail size={18} className="text-white" />
                      </a>
                    )}
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-white/10 hover:bg-blue-500/50 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Linkedin size={18} className="text-white" />
                      </a>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                <p className="text-sm text-blue-400 font-medium">{member.position}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

'use client'
import React from 'react';

interface MenuProps {
  showAdminDashboard: boolean;
  showAdminSettings: boolean;
  showSettings: boolean;
  showContact: boolean;
  showProfile: boolean;
  showUserMenu: boolean;
}

export default function Menu({
  showAdminDashboard,
  showAdminSettings,
  showSettings,
  showContact,
  showProfile,
  showUserMenu,
}: MenuProps) {
  return (
    <nav className="bg-gray-800 p-4 text-white">
      <ul className="flex space-x-4">
        <li><a href="/">Нүүр хуудас</a></li>
        <li><a href="/about">Тухай</a></li>

        {showAdminDashboard && (
          <li><a href="/admin/hotel">Админ хуудас</a></li>
        )}

        {showAdminSettings && (
          <li><a href="/admin/settings">Админы тохиргоо</a></li>
        )}

        {showSettings && (
          <li><a href="/settings">Тохиргоо</a></li>
        )}

        {showContact && (
          <li><a href="/contact">Холбоо барих</a></li>
        )}

        {showProfile && (
          <li><a href="/profile">Хувийн мэдээлэл</a></li>
        )}

        {showUserMenu && (
          <li><a href="/user/menu">Хэрэглэгчийн цэс</a></li>
        )}
      </ul>
    </nav>
  );
}

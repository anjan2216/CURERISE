import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bell, Search, Heart, LogOut } from 'lucide-react';
import logo from '@/assets/curerise-logo.png';

function Header({ onLogout }) {
  return React.createElement(
    'header',
    { className: 'bg-background border-b border-border sticky top-0 z-50' },
    React.createElement(
      'div',
      { className: 'container mx-auto px-4 py-4' },
      React.createElement(
        'div',
        { className: 'flex items-center justify-between' },

        // Logo & Brand
        React.createElement(
          'div',
          { className: 'flex items-center gap-3' },
          React.createElement('img', { src: logo, alt: 'CureRise', className: 'w-8 h-8' }),
          React.createElement(
            'div',
            null,
            React.createElement(
              'h1',
              { className: 'text-xl font-bold text-primary' },
              'CureRise'
            ),
            React.createElement(
              'p',
              { className: 'text-xs text-muted-foreground' },
              'Healthcare for All'
            )
          )
        ),

        // Search Bar - Hidden on mobile
        React.createElement(
          'div',
          { className: 'hidden md:flex items-center flex-1 max-w-md mx-8' },
          React.createElement(
            'div',
            { className: 'relative w-full' },
            React.createElement(Search, { className: 'absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' }),
            React.createElement('input', {
              type: 'text',
              placeholder: 'Search patients, hospitals, or campaigns...',
              className: 'w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
            })
          )
        ),

        // Right Actions
        React.createElement(
          'div',
          { className: 'flex items-center gap-4' },

          // Notifications
          React.createElement(
            Button,
            { variant: 'ghost', size: 'sm', className: 'relative' },
            React.createElement(Bell, { className: 'h-5 w-5' }),
            React.createElement(
              Badge,
              { className: 'absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-accent' },
              '3'
            )
          ),

          // Impact Counter
          React.createElement(
            'div',
            { className: 'hidden sm:flex items-center gap-2 bg-medical-soft px-3 py-2 rounded-lg' },
            React.createElement(Heart, { className: 'h-4 w-4 text-primary' }),
            React.createElement(
              'span',
              { className: 'text-sm font-medium text-primary' },
              '₹12,450 donated'
            )
          ),

          // User Menu
          React.createElement(
            'div',
            { className: 'flex items-center gap-3' },
            React.createElement(
              Avatar,
              { className: 'h-8 w-8' },
              React.createElement(
                AvatarFallback,
                { className: 'bg-primary text-primary-foreground text-sm font-medium' },
                'RK'
              )
            ),
            React.createElement(
              'div',
              { className: 'hidden sm:block' },
              React.createElement(
                'p',
                { className: 'text-sm font-medium' },
                'Rahul Kumar'
              ),
              React.createElement(
                'p',
                { className: 'text-xs text-muted-foreground' },
                'Donor'
              )
            ),
            React.createElement(
              Button,
              { variant: 'ghost', size: 'sm', onClick: onLogout },
              React.createElement(LogOut, { className: 'h-4 w-4' })
            )
          )
        )
      )
    )
  );
}

export default Header;

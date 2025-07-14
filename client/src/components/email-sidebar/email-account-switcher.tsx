import React, { useState } from 'react';
import { ChevronDown, Mail, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EmailAccount {
  id: string;
  email: string;
  name: string;
  provider: 'gmail' | 'outlook' | 'custom';
  unreadCount: number;
}

interface EmailAccountSwitcherProps {
  accounts: EmailAccount[];
  selectedAccount: EmailAccount | null;
  onAccountSelect: (account: EmailAccount) => void;
  onAddAccount: () => void;
}

export function EmailAccountSwitcher({ 
  accounts, 
  selectedAccount, 
  onAccountSelect, 
  onAddAccount 
}: EmailAccountSwitcherProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="truncate">
              {selectedAccount ? selectedAccount.email : 'Select Account'}
            </span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        {accounts.length === 0 ? (
          <DropdownMenuItem onClick={onAddAccount}>
            <Plus className="h-4 w-4 mr-2" />
            Connect Email Account
          </DropdownMenuItem>
        ) : (
          <>
            {accounts.map((account) => (
              <DropdownMenuItem
                key={account.id}
                onClick={() => onAccountSelect(account)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{account.name}</div>
                    <div className="text-sm text-muted-foreground">{account.email}</div>
                  </div>
                </div>
                {account.unreadCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    {account.unreadCount}
                  </span>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onAddAccount}>
              <Plus className="h-4 w-4 mr-2" />
              Add Another Account
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
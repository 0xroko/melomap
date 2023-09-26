import { Pannel } from "@/components";
import { useAppSettings, useAppState } from "@/lib/store";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { signOut, useSession } from "next-auth/react";

interface MenuItemProps extends DropdownMenu.MenuCheckboxItemProps {
  children?: React.ReactNode | React.ReactNode[];
}

export const MenuCheckboxItem = ({ children, ...props }: MenuItemProps) => {
  return (
    <DropdownMenu.CheckboxItem
      className="relative flex h-[25px] select-none items-center rounded-[3px] px-[5px] pl-[25px] text-[13px] leading-none text-white outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-neutral-800 data-[disabled]:text-neutral-800 data-[highlighted]:text-white"
      {...props}
    >
      <DropdownMenu.ItemIndicator className="absolute left-0 inline-flex w-[25px] items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-3 w-3"
        >
          <path
            fillRule="evenodd"
            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
            clipRule="evenodd"
          />
        </svg>
      </DropdownMenu.ItemIndicator>
      {children}
    </DropdownMenu.CheckboxItem>
  );
};

interface MenuItemProps extends DropdownMenu.MenuItemProps {
  children?: React.ReactNode | React.ReactNode[];
}

export const MenuItem = ({ children, ...props }: MenuItemProps) => {
  return (
    <DropdownMenu.Item
      {...props}
      className="group relative flex h-[25px] select-none items-center rounded-[3px] px-[5px] pl-[25px] text-[13px] leading-none text-white outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-neutral-800 data-[disabled]:text-neutral-800  data-[highlighted]:text-white"
    >
      {children}
    </DropdownMenu.Item>
  );
};

interface MenuProps {
  children?: React.ReactNode | React.ReactNode[];
}
export const Menu = ({ children }: MenuProps) => {
  const appSettings = useAppSettings();
  const refetch = useAppState((state) => state.refetch);
  const session = useSession();

  const isLoggedin = !!session.data?.user;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Pannel
          className={`right-2 top-2 flex cursor-pointer px-2 py-2 text-neutral-400 duration-300 hover:text-white`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6"
          >
            <path
              fillRule="evenodd"
              d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
              clipRule="evenodd"
            />
          </svg>
        </Pannel>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-[999] min-w-[220px] rounded-md bg-neutral-900 bg-opacity-60 p-[5px] backdrop-blur-md  will-change-[opacity,transform] data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade"
          sideOffset={3}
          side="bottom"
          alignOffset={3}
          align="end"
        >
          <MenuCheckboxItem
            onCheckedChange={(t) => appSettings.setShowLegend(t)}
            checked={appSettings.showLegend}
          >
            Show legend
          </MenuCheckboxItem>
          <MenuCheckboxItem
            onCheckedChange={(t) => appSettings.setShowSpotifyArtistView(t)}
            checked={appSettings.showSpotifyArtistView}
          >
            Show Spotify artist info
          </MenuCheckboxItem>
          {/* <DropdownMenu.Separator className="m-[5px] h-[1px] bg-neutral-800" /> */}

          {/* <MenuItem
            onClick={() => {
              refresh();
            }}
          >
            Reanimate
          </MenuItem> */}
          {/* <MenuItem
            onClick={() => {
              refetch();
            }}
          >
            Refetch
          </MenuItem> */}

          <DropdownMenu.Separator className="m-[5px] h-[1px] bg-neutral-800" />
          <MenuItem
            disabled={!isLoggedin}
            onSelect={() => {
              signOut({ redirect: true, callbackUrl: "/" });
            }}
          >
            Logout
          </MenuItem>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

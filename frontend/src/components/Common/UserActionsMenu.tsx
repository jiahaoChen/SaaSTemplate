import { BsThreeDotsVertical } from "react-icons/bs"
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu"
import { Button } from "../ui/button"

import type { UserPublic } from "@/client"
import DeleteUser from "../Admin/DeleteUser"
import EditUser from "../Admin/EditUser"

interface UserActionsMenuProps {
  user: UserPublic
  disabled?: boolean
}

export const UserActionsMenu = ({ user, disabled }: UserActionsMenuProps) => {
  return (
    <MenuRoot>
      <MenuTrigger>
        <Button 
          variant="text" 
          size="small" 
          icon={<BsThreeDotsVertical />} 
          disabled={disabled}
        />
      </MenuTrigger>
      <MenuContent>
        <EditUser user={user} />
        <DeleteUser user={user} />
      </MenuContent>
    </MenuRoot>
  )
}

import { BsThreeDotsVertical } from "react-icons/bs"
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu"
import { Button } from "../ui/button"

import type { ItemPublic } from "@/client"
import DeleteItem from "../Items/DeleteItem"
import EditItem from "../Items/EditItem"

interface ItemActionsMenuProps {
  item: ItemPublic
}

export const ItemActionsMenu = ({ item }: ItemActionsMenuProps) => {
  return (
    <MenuRoot>
      <MenuTrigger>
        <Button variant="text" size="small" icon={<BsThreeDotsVertical />} />
      </MenuTrigger>
      <MenuContent>
        <EditItem item={item} />
        <DeleteItem item={item} />
      </MenuContent>
    </MenuRoot>
  )
}

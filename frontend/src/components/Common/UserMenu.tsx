import { Link } from "@tanstack/react-router"
import { FaUserAstronaut } from "react-icons/fa"
import { FiLogOut, FiUser } from "react-icons/fi"

import useAuth from "@/hooks/useAuth"
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "../ui/menu"
import { Button } from "../ui/button"
import { Flex, Box, Text } from "../ui/styled"

const UserMenu = () => {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    logout()
  }

  return (
    <>
      {/* Desktop */}
      <Flex>
        <MenuRoot>
          <MenuTrigger>
            <Button 
              data-testid="user-menu" 
              type="primary" 
              style={{ maxWidth: '200px' }}
              icon={<FaUserAstronaut />}
            >
              <Text truncate>{user?.full_name || "User"}</Text>
            </Button>
          </MenuTrigger>

          <MenuContent>
            <Link to="/settings">
              <MenuItem>
                <Box display="flex" alignItems="center" gap={2} py={2} cursor="pointer">
                  <FiUser fontSize="18px" />
                  <Box>My Profile</Box>
                </Box>
              </MenuItem>
            </Link>

            <MenuItem onClick={handleLogout}>
              <Box display="flex" alignItems="center" gap={2} py={2} cursor="pointer">
                <FiLogOut />
                Log Out
              </Box>
            </MenuItem>
          </MenuContent>
        </MenuRoot>
      </Flex>
    </>
  )
}

export default UserMenu

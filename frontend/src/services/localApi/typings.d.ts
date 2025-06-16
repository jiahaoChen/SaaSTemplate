declare namespace API {
  type BodyLoginLoginAccessToken = {
    /** Grant Type */
    grant_type?: string | null;
    /** Username */
    username: string;
    /** Password */
    password: string;
    /** Scope */
    scope?: string;
    /** Client Id */
    client_id?: string | null;
    /** Client Secret */
    client_secret?: string | null;
  };

  type HTTPValidationError = {
    /** Detail */
    detail?: ValidationError[];
  };

  type ItemCreate = {
    /** Title */
    title: string;
    /** Description */
    description?: string | null;
  };

  type ItemPublic = {
    /** Title */
    title: string;
    /** Description */
    description?: string | null;
    /** Id */
    id: string;
    /** Owner Id */
    owner_id: string;
  };

  type itemsDeleteItemParams = {
    id: string;
  };

  type ItemsPublic = {
    /** Data */
    data: ItemPublic[];
    /** Count */
    count: number;
  };

  type itemsReadItemParams = {
    id: string;
  };

  type itemsReadItemsParams = {
    skip?: number;
    limit?: number;
  };

  type itemsUpdateItemParams = {
    id: string;
  };

  type ItemUpdate = {
    /** Title */
    title?: string | null;
    /** Description */
    description?: string | null;
  };

  type loginRecoverPasswordHtmlContentParams = {
    email: string;
  };

  type loginRecoverPasswordParams = {
    email: string;
  };

  type Message = {
    /** Message */
    message: string;
  };

  type NewPassword = {
    /** Token */
    token: string;
    /** New Password */
    new_password: string;
  };

  type PrivateUserCreate = {
    /** Email */
    email: string;
    /** Password */
    password: string;
    /** Full Name */
    full_name: string;
    /** Is Verified */
    is_verified?: boolean;
  };

  type Token = {
    /** Access Token */
    access_token: string;
    /** Token Type */
    token_type?: string;
  };

  type UpdatePassword = {
    /** Current Password */
    current_password: string;
    /** New Password */
    new_password: string;
  };

  type UserCreate = {
    /** Email */
    email: string;
    /** Is Active */
    is_active?: boolean;
    /** Is Superuser */
    is_superuser?: boolean;
    /** Full Name */
    full_name?: string | null;
    /** Password */
    password: string;
  };

  type UserPublic = {
    /** Email */
    email: string;
    /** Is Active */
    is_active?: boolean;
    /** Is Superuser */
    is_superuser?: boolean;
    /** Full Name */
    full_name?: string | null;
    /** Id */
    id: string;
  };

  type UserRegister = {
    /** Email */
    email: string;
    /** Password */
    password: string;
    /** Full Name */
    full_name?: string | null;
  };

  type usersDeleteUserParams = {
    user_id: string;
  };

  type UsersPublic = {
    /** Data */
    data: UserPublic[];
    /** Count */
    count: number;
  };

  type usersReadUserByIdParams = {
    user_id: string;
  };

  type usersReadUsersParams = {
    skip?: number;
    limit?: number;
  };

  type usersUpdateUserParams = {
    user_id: string;
  };

  type UserUpdate = {
    /** Email */
    email?: string | null;
    /** Is Active */
    is_active?: boolean;
    /** Is Superuser */
    is_superuser?: boolean;
    /** Full Name */
    full_name?: string | null;
    /** Password */
    password?: string | null;
  };

  type UserUpdateMe = {
    /** Full Name */
    full_name?: string | null;
    /** Email */
    email?: string | null;
  };

  type utilsTestEmailParams = {
    email_to: string;
  };

  type ValidationError = {
    /** Location */
    loc: (string | number)[];
    /** Message */
    msg: string;
    /** Error Type */
    type: string;
  };
}

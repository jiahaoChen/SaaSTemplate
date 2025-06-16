import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { createElement } from 'react';
import useStyles from './index.style';
export type EditableLink = {
  title: string;
  href: string;
  id?: string;
};
type EditableLinkGroupProps = {
  onAdd?: () => void;
  links?: EditableLink[];
  linkElement?: any;
};
const EditableLinkGroup: React.FC<EditableLinkGroupProps> = ({
  links = [],
  linkElement: LinkElement = 'a',
  onAdd = () => {},
}) => {
  const { styles } = useStyles();
  return (
    <div className={styles.linkGroup}>
      {links.map((link) =>
        createElement(
          LinkElement,
          {
            key: `linkGroup-item-${link.id || link.title}`,
            to: link.href,
            href: link.href,
          },
          link.title,
        ),
      )}
      <Button size="small" type="primary" ghost onClick={onAdd}>
        <PlusOutlined /> 添加
      </Button>
    </div>
  );
};
export default EditableLinkGroup;

import type { MouseEvent } from 'react';
import { Table, Tooltip, Button, Space } from 'antd';
import { FileText, Trash2 } from 'lucide-react';
import type { DocumentItem } from '../type';

export interface DocumentTableProps {
  // 1. 这里写输入数据`
  data: any[];
  selectedId: string | number;
  // 2. 这里写回调函数
  onSelectDocument?: (id: string | number) => void;
  onDeleteDocument?: (id: string | number) => void;
}

export const DocumentTable = ({ data, selectedId, onSelectDocument, onDeleteDocument }: DocumentTableProps) => {
  
  // 3. 难度点：columns 的定义要写在这个里面！
  // 并且，columns 里面的 onClick 回调，不能用原版 AI 写的，而是直接调用 props 里的 onSelectDocument / onDeleteDocument。
    const columns = [
      {
        title: '文档名称',
        dataIndex: 'title',
        key: 'title',
        render: (text: string, record: DocumentItem) => (
          <Space style={{ cursor: 'pointer', fontWeight: 500, color: '#1F2329' }} onClick={() => {
            if (onSelectDocument) onSelectDocument(record.id)
          }}>
            <FileText size={16} style={{ color: '#3370FF' }} />
            <span style={{ color: selectedId === record.id ? '#3370FF' : '#1F2329' }}>
              {text}
            </span>
          </Space>
        )
      },
      {
        title: '操作',
        key: 'action',
        width: '80px',
        align: 'center' as const,
        render: (_: any, record: DocumentItem) => (
          <Tooltip title="删除文档">
            <Button
              type="text"
              danger
              icon={<Trash2 size={14} />}
              onClick={(e: MouseEvent<HTMLElement>) => {
                e.stopPropagation()
                if (onDeleteDocument) {
                  onDeleteDocument(record.id)
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
            />
          </Tooltip>
        )
      }
    ];

  return (
    <Table
      dataSource={data}
      columns={columns}
      rowKey="id"
      pagination={false}
      showHeader={false}
      size="large"
      style={{
        border: '1px solid #EAEBEF',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    />
  );
};
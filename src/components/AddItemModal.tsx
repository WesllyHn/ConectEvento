import { Modal, Form, Input, Select } from 'antd';

const { Option } = Select;
const { TextArea } = Input;

interface AddItemModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: {
    title: string;
    description: string;
    category: string;
    price: string;
  }) => void;
  loading?: boolean;
}

export function AddItemModal({ visible, onCancel, onSubmit, loading }: AddItemModalProps) {
  const [form] = Form.useForm();

const handleOk = async () => {
  try {
    const values = await form.validateFields();
    const normalizedValues = {
      ...values,
      price: Number(values.price),
    };
    onSubmit(normalizedValues);
    form.resetFields();
  } catch (error) {
    console.error('Validation failed:', error);
  }
};


  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Adicionar Item ao Roadmap"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Adicionar"
      cancelText="Cancelar"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        name="add_roadmap_item"
      >
        <Form.Item
          name="title"
          label="Título do Item"
          rules={[{ required: true, message: 'Por favor, insira o título do item' }]}
        >
          <Input placeholder="Ex: Fotógrafo, Decoração..." />
        </Form.Item>

        <Form.Item
          name="description"
          label="Descrição"
          rules={[{ required: true, message: 'Por favor, insira a descrição' }]}
        >
          <TextArea
            rows={3}
            placeholder="Descrição do item..."
          />
        </Form.Item>

        <Form.Item
          name="category"
          label="Categoria"
          rules={[{ required: true, message: 'Por favor, selecione uma categoria' }]}
        >
          <Select placeholder="Selecione uma categoria">
            <Option value="BIRTHDAY">Aniversário</Option>
            <Option value="WEDDING">Casamento</Option>
            <Option value="CORPORATE">Corporativo</Option>
            <Option value="GRADUATION">Formatura</Option>
            <Option value="OTHER">Outro</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="price"
          label="Preço"
          rules={[{ required: true, message: 'Por favor, insira o preço' }]}
        >
          <Input placeholder="Ex: 2000,00" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Checkbox, Form } from "antd";

 export function SelectAllCheckboxGroup({ form, name, label, options }) {
  const allValues = useMemo(() => options.map((o) => o.value), [options]);
  const watched = Form.useWatch(name, form) || [];

  const checkAll = watched.length === allValues.length && allValues.length > 0;
  const indeterminate = watched.length > 0 && watched.length < allValues.length;

  return (
    <Form.Item label={label}>
      <Checkbox
        indeterminate={indeterminate}
        checked={checkAll}
        onChange={(e) => {
          const list = e.target.checked ? allValues : [];
          form.setFieldsValue({ [name]: list });
        }}
        style={{ marginBottom: 8 }}
      >
        Seleccionar todo
      </Checkbox>

      <Form.Item name={name} noStyle>
        <Checkbox.Group options={options} />
      </Form.Item>
    </Form.Item>
  );
}

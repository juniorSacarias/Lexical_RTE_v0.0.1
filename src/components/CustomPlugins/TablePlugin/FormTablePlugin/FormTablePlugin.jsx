import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material';

const TableForm = ({ open, onClose, onSubmit }) => {
	const [rows, setRows] = useState(3);
	const [columns, setColumns] = useState(3);

	const handleRowsChange = event => setRows(Number(event.target.value));
	const handleColumnsChange = event => setColumns(Number(event.target.value));

	const handleSubmit = () => {
		onSubmit({ rows, columns });
		onClose();
	};

	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>Create Table</DialogTitle>
			<DialogContent>
				<TextField
					autoFocus
					margin="dense"
					label="Rows"
					type="number"
					fullWidth
					value={rows}
					onChange={handleRowsChange}
				/>
				<TextField
					margin="dense"
					label="Columns"
					type="number"
					fullWidth
					value={columns}
					onChange={handleColumnsChange}
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} color="primary">
					Cancel
				</Button>
				<Button onClick={handleSubmit} color="primary">
					Create
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default TableForm;

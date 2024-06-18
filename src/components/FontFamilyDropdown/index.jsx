import { MenuItem, Select } from '@mui/material';

const FontFamilyDropdown = ({ selectedFont, onChange }) => {
	const fontFamilyArray = ['Roboto', 'Arial', 'Courier New'];
	return (
		<Select value={selectedFont} onChange={onChange} sx={{height: "35px", top: "-3px"}}>
			{fontFamilyArray.map(font => (
				<MenuItem key={font} value={font}>
					{font}
				</MenuItem>
			))}
		</Select>
	);
};

export default FontFamilyDropdown;
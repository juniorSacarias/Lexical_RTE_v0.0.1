import { CssBaseline, Grid, ThemeProvider } from '@mui/material';
import LexicalEditorWrapper from './components/LexicalEditorWrapper';
import theme from './theme';
import './App.css';

function App() {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Grid container sx={{ minHeight: '100vh', mt:5 }} flexDirection="column" alignItems="center">
				<Grid item sx={{ width: 750, overflow: 'hidden' }}>
					<LexicalEditorWrapper />
				</Grid>
			</Grid>
		</ThemeProvider>
	);
}

export default App;

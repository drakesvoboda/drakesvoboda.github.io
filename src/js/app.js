import NeuralNet from './nn';
import NoiseSphere from './noise-sphere';
import { requestAnimFrame } from './animation';

const App = (function () {
	function handleNNCanvas() {
		var _ = new NeuralNet(document.getElementById("nn"));
	}

	return {
		main: function () {
			requestAnimFrame(() => {
				const nsElement = document.getElementById("nn");
				NoiseSphere(nsElement);
			});
		}
	}
}());

export default App;
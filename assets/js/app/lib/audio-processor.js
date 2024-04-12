/**
 * A simple audio node demo.
 *
 * @class AudioProcessor
 * @extends AudioWorkletProcessor
 */
class AudioProcessor extends AudioWorkletProcessor {

  // When constructor() undefined, the default constructor will be
  // implicitly used.

  process(inputs, outputs) {
    // By default, the node has single input and output.
    const input = inputs[0]
    const output = outputs[0]

    for (let channel = 0; channel < output.length; ++channel) {
      if (input[channel]) {
        // console.log("input exists", input)
        output[channel].set(input[channel])
      } else {
        // console.log("input missing", input)
        return false
      }
    }

    return true
  }
}

registerProcessor('audio-processor', AudioProcessor)

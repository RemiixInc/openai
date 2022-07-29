const { Configuration, OpenAIApi } = require("openai");

module.exports = async (req, res) => {
  const prompt = req.query.prompt;

  const key = req.query.key;
  const model = req.query.model
    ? req.query.model == "davinci"
      ? `text-davinci-002`
      : `text-${req.query.model}-001`
    : "text-babbage-001";
  const temperature = Number(req.query.temperature) || 0.3;
  const length = Number(req.query.length) || 200;

  if (!req.query.prompt)
    return res.json({
      success: false,
      error: "Please specify a prompt query.",
      data: null,
    });

  if (
    !key &&
    (length > 200 || model === "text-davinci-002" || model === "text-curie-001")
  )
    return res.json({
      success: false,
      error:
        "The parameter(s) entered require a custom API Key to be specified.",
      data: null,
    });

  if (temperature < 0 || temperature > 1 || length < 0)
    return res.json({
      success: false,
      error: "The integer(s) specified are too large or too small.",
      data: null,
    });

  const configuration = new Configuration({
    apiKey: key || process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  openai
    .createCompletion(model, {
      prompt: prompt,
      temperature: temperature,
      max_tokens: length,
    })
    .then((response) => {
      res.json({
        success: false,
        error: null,
        data: response.data.choices[0].text,
      });
    })
    .catch((error) => {
      console.error(error);
      res.json({
        success: false,
        error:
          "The server encountered an error. You may have inputted an invalid query.",
        data: null,
      });
    });
}

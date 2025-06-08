namespace Questionnaire.Domain.Entities
{
    public sealed class Question
    {
        private Question() { }

        public Question(int sectionId, string wording, QuestionType type, int? maxLength = null)
        {
            SectionId = sectionId;
            Wording = wording;
            Type = type;
            Mandatory = true;  // All questions are mandatory
            MaxLength = maxLength;
            SetOptions(type); // Automatically set options based on the type
        }

        public int Id { get; set; }
        public int SectionId { get; set; }  // Foreign Key to Section
      
        public string Wording { get; set; } = string.Empty;
        public QuestionType Type { get; set; }
        public bool Mandatory { get; set; } = true;  // Always mandatory
        public int? MaxLength { get; set; }

        // Options for Likert and Binary questions
        public List<string> Options { get; private set; } = new List<string>();

        private void SetOptions(QuestionType type)
        {
            if (type == QuestionType.Likert)
            {
                Options.Add("1");
                Options.Add("2");
                Options.Add("3");
                Options.Add("4");
                Options.Add("5");
            }
            else if (type == QuestionType.Binary)
            {
                Options.Add("0");
                Options.Add("1");
            }
        }
    }
}

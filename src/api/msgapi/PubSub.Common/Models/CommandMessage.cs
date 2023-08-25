using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PubSub.Common.Models
{
    public class CommandMessage
    {
        public Guid? Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Tool { get; set; }
        public string Version { get; set; }
        public string Command { get; set; }
        public string Arguments { get; set; }
        public string Schedule { get; set; }
        public string Target { get; set; } // ADO, GH, ZZ
        public string FullCommand { get; set; }
        public string OutputPath { get; set; }
        public string OutputFileName { get; set; }
        public IDictionary<string, string> ArgumentsDict { get; set; } = new Dictionary<string, string>();

    }
}

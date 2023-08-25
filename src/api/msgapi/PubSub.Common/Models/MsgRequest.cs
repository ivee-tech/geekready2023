namespace PubSub.Common.Models
{
    public class MsgRequest
    {
        public CommandMessage Data { get; set; }
        public string Operation { get; set; } = "create";
    }
}

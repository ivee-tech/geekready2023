using PubSub.Common.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PubSub.Common.Interfaces
{
    public interface ICommandMessageService
    {
        Task<MsgResponse> PublishCommandMessage(MsgRequest request);
    }
}

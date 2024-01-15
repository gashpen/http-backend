const http = require('http');
const Koa = require('koa');
const { koaBody } = require('koa-body');
const cors = require('@koa/cors');
const uuid = require('uuid');

const app = new Koa();
app.use(cors());

app.use(koaBody({
  urlencoded: true,
  multipart: true,
}));


let ticketsFull = [];

app.use(async ctx => {
  const params = new URLSearchParams(ctx.request.querystring);
  const { method, id } = { method: params.get("method"), id: params.get("id") };
  
  let findedTicket = null;

  switch (method) {
    case 'allTickets':
      if (ticketsFull.length > 0) {
        ctx.response.body = { status: true, tickets: ticketsFull };
      } else {
        ctx.response.body = { status: false };
      }
      break;

    case 'changeStatus':
      console.log(ticketsFull)
      findedTicket = ticketsFull.find(ticket => ticket.generatedId === id);
      
      if (findedTicket) {
        findedTicket.status = !findedTicket.status;
        ctx.response.body = { status: findedTicket.status };
      } else {
        ctx.response.status = 404;
      }
      break;
      
    case 'deleteTicket':
      findedTicket = ticketsFull.find(ticket => ticket.generatedId == id);
      if (findedTicket) {
        ticketsFull = ticketsFull.filter(ticket => ticket.generatedId != findedTicket.generatedId);
        ctx.response.body = findedTicket;
      }
      break;

    case 'changeTicket':
      const { ticketName: name, ticketDescription: description } = { ticketName: params.get("ticketName"), ticketDescription: params.get("ticketDescription") };

      findedTicket = ticketsFull.find(ticket => ticket.generatedId === id);
      if (findedTicket) {
        findedTicket.ticketName = name;
        findedTicket.ticketDescription = description;

        ctx.response.body = findedTicket;
      }
      break;

    case 'createTicket':
      const { ticketName, ticketDescription, created } = ctx.request.body;
      const generatedId = uuid.v4();

      const fullTicket = { generatedId, ticketName, ticketStatus: false, created, ticketDescription};

      ticketsFull.push(fullTicket);
      ctx.response.body = fullTicket;
      break;

    default:
        ctx.response.status = 404;
        break;
  }

})

const server = http.createServer(app.callback());
const port = 7070;
server.listen(port, (err) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log('Server is listening on ' + port);
});